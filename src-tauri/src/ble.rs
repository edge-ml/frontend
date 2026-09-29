use btleplug::api::{Central, CentralEvent, CharPropFlags, Manager as _, Peripheral, ScanFilter, WriteType};
use btleplug::platform::{Adapter, Manager, Peripheral as PlatformPeripheral};
use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use tauri::{AppHandle, Emitter, State};
use tokio::sync::Mutex;

#[derive(Default)]
pub struct BleState {
    pub adapter: Arc<Mutex<Option<Adapter>>>,
    pub peripherals: Arc<Mutex<HashMap<String, PlatformPeripheral>>>,
    pub connected_peripherals: Arc<Mutex<HashMap<String, PlatformPeripheral>>>,
    pub notification_tasks: Arc<
        Mutex<HashMap<String, tokio::sync::oneshot::Sender<()>>>,
    >,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct BleDeviceInfo {
    pub id: String,
    pub name: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct BleServiceInfo {
    pub uuid: String,
    pub characteristics: Vec<BleCharacteristicInfo>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct BleCharacteristicInfo {
    pub uuid: String,
    pub properties: Vec<String>,
}

async fn get_adapter(state: &State<'_, BleState>) -> Result<Adapter, String> {
    let mut guard = state.adapter.lock().await;
    if let Some(ref adapter) = *guard {
        return Ok(adapter.clone());
    }

    let manager = Manager::new().await.map_err(|e| e.to_string())?;
    let adapters = manager.adapters().await.map_err(|e| e.to_string())?;
    if adapters.is_empty() {
        return Err("No Bluetooth adapter found".into());
    }
    let adapter = adapters[0].clone();
    *guard = Some(adapter.clone());
    Ok(adapter)
}

/// btleplug's CoreBluetooth backend runs a dedicated thread with a message
/// channel. If that thread panics (for example when a peripheral disconnects
/// while services are being discovered) every later command fails with
/// "Channel closed" and the cached adapter can never recover. Clearing the
/// cached state lets the next command spawn a fresh CoreBluetooth thread.
fn is_channel_closed(error: &str) -> bool {
    error.contains("Channel closed")
}

impl BleState {
    async fn recover(&self) {
        {
            let mut tasks = self.notification_tasks.lock().await;
            for (_, cancel_tx) in tasks.drain() {
                let _ = cancel_tx.send(());
            }
        }

        self.connected_peripherals.lock().await.clear();
        self.peripherals.lock().await.clear();
        *self.adapter.lock().await = None;
    }
}

fn uuid_matches(actual: &str, requested: &str) -> bool {
    actual == requested
        || actual.contains(
            requested
                .trim_start_matches("0000")
                .trim_end_matches("-0000-1000-8000-00805f9b34fb"),
        )
}

async fn read_characteristic_inner(
    peripheral: &PlatformPeripheral,
    service_uuid: &str,
    characteristic_uuid: &str,
) -> Result<Vec<u8>, String> {
    let services = peripheral.services();
    for service in &services {
        if uuid_matches(&service.uuid.to_string(), service_uuid) {
            for c in &service.characteristics {
                if uuid_matches(&c.uuid.to_string(), characteristic_uuid) {
                    return peripheral
                        .read(c)
                        .await
                        .map_err(|e| format!("Read failed: {}", e));
                }
            }
        }
    }
    Err("Characteristic not found".into())
}

async fn write_characteristic_inner(
    peripheral: &PlatformPeripheral,
    service_uuid: &str,
    characteristic_uuid: &str,
    data: &[u8],
    write_without_response: bool,
) -> Result<(), String> {
    let services = peripheral.services();
    for service in &services {
        if uuid_matches(&service.uuid.to_string(), service_uuid) {
            for c in &service.characteristics {
                if uuid_matches(&c.uuid.to_string(), characteristic_uuid) {
                    let write_type = if write_without_response {
                        WriteType::WithoutResponse
                    } else {
                        WriteType::WithResponse
                    };
                    return peripheral
                        .write(c, data, write_type)
                        .await
                        .map_err(|e| format!("Write failed: {}", e));
                }
            }
        }
    }
    Err("Characteristic not found".into())
}

async fn ble_scan_inner(
    state: &State<'_, BleState>,
) -> Result<Vec<BleDeviceInfo>, String> {
    let adapter = get_adapter(state).await?;
    // Subscribe before starting the scan so the picker only offers devices
    // that advertised now, rather than every peripheral cached by the adapter.
    let mut events = adapter.events().await.map_err(|e| e.to_string())?;

    adapter
        .start_scan(ScanFilter::default())
        .await
        .map_err(|e| e.to_string())?;

    let deadline = tokio::time::Instant::now() + tokio::time::Duration::from_secs(5);
    let mut seen_ids = HashSet::new();
    while let Ok(Some(event)) = tokio::time::timeout_at(deadline, events.next()).await {
        match event {
            CentralEvent::DeviceDiscovered(id) | CentralEvent::DeviceUpdated(id) => {
                seen_ids.insert(id.to_string());
            }
            _ => {}
        }
    }

    adapter
        .stop_scan()
        .await
        .map_err(|e| e.to_string())?;

    let peripherals = adapter.peripherals().await.map_err(|e| e.to_string())?;
    let mut devices = Vec::new();
    let mut peripherals_guard = state.peripherals.lock().await;
    peripherals_guard.clear();

    for p in peripherals {
        let id = p.id().to_string();
        if !seen_ids.contains(&id) {
            continue;
        }
        let props = p.properties().await.map_err(|e| e.to_string())?;
        if let Some(properties) = props {
            let name = properties
                .local_name
                .unwrap_or_else(|| "Unknown".into());
            peripherals_guard.insert(id.clone(), p);
            devices.push(BleDeviceInfo { id, name });
        }
    }

    Ok(devices)
}

#[tauri::command]
pub async fn ble_scan(state: State<'_, BleState>) -> Result<Vec<BleDeviceInfo>, String> {
    match ble_scan_inner(&state).await {
        Ok(devices) => Ok(devices),
        Err(error) if is_channel_closed(&error) => {
            log::warn!(
                "BLE scan failed because the CoreBluetooth channel closed; resetting adapter: {}",
                error
            );
            state.recover().await;
            ble_scan_inner(&state).await
        }
        Err(error) => Err(error),
    }
}

async fn ble_connect_inner(
    device_id: &str,
    state: &State<'_, BleState>,
) -> Result<Vec<BleServiceInfo>, String> {
    let peripheral = {
        let peripherals = state.peripherals.lock().await;
        peripherals
            .get(device_id)
            .cloned()
            .ok_or_else(|| "Device not found. Please scan first.".to_string())?
    };

    let already_connected = tokio::time::timeout(
        tokio::time::Duration::from_secs(4),
        peripheral.is_connected(),
    )
    .await
    .map_err(|_| "Bluetooth adapter did not respond while checking the device connection".to_string())?
    .map_err(|e| e.to_string())?;

    if !already_connected {
        // CoreBluetooth's btleplug connect also waits for service discovery.
        // A stale peripheral can otherwise leave this future pending forever.
        tokio::time::timeout(tokio::time::Duration::from_secs(18), peripheral.connect())
            .await
            .map_err(|_| "Bluetooth connection timed out. Scan again and select a device that is awake and nearby.".to_string())?
            .map_err(|e| format!("Connect failed: {}", e))?;
    }

    tokio::time::timeout(tokio::time::Duration::from_secs(3), peripheral.discover_services())
        .await
        .map_err(|_| "Bluetooth service discovery timed out".to_string())?
        .map_err(|e| format!("Service discovery failed: {}", e))?;

    let services = peripheral.services();
    let mut service_infos = Vec::new();

    for service in services {
        let mut chars = Vec::new();
        for c in &service.characteristics {
            let props = vec![
                if c.properties.contains(CharPropFlags::READ) {
                    "read"
                } else {
                    ""
                },
                if c.properties.contains(CharPropFlags::WRITE) {
                    "write"
                } else {
                    ""
                },
                if c.properties.contains(CharPropFlags::WRITE_WITHOUT_RESPONSE) {
                    "write_without_response"
                } else {
                    ""
                },
                if c.properties.contains(CharPropFlags::NOTIFY) {
                    "notify"
                } else {
                    ""
                },
                if c.properties.contains(CharPropFlags::INDICATE) {
                    "indicate"
                } else {
                    ""
                },
            ]
            .iter()
            .filter(|s| !s.is_empty())
            .map(|s| s.to_string())
            .collect();

            chars.push(BleCharacteristicInfo {
                uuid: c.uuid.to_string(),
                properties: props,
            });
        }

        service_infos.push(BleServiceInfo {
            uuid: service.uuid.to_string(),
            characteristics: chars,
        });
    }

    state
        .connected_peripherals
        .lock()
        .await
        .insert(device_id.to_string(), peripheral);

    Ok(service_infos)
}

#[tauri::command]
pub async fn ble_connect(
    device_id: String,
    state: State<'_, BleState>,
) -> Result<Vec<BleServiceInfo>, String> {
    match ble_connect_inner(&device_id, &state).await {
        Ok(services) => Ok(services),
        Err(error) if is_channel_closed(&error) => {
            log::warn!(
                "BLE connect failed because the CoreBluetooth channel closed; resetting adapter: {}",
                error
            );
            state.recover().await;
            Err(
                "The Bluetooth connection was lost. Please scan for the device again and retry."
                    .to_string(),
            )
        }
        Err(error) => Err(error),
    }
}

#[tauri::command]
pub async fn ble_read_characteristic(
    device_id: String,
    service_uuid: String,
    characteristic_uuid: String,
    state: State<'_, BleState>,
) -> Result<Vec<u8>, String> {
    let peripheral = {
        let connected = state.connected_peripherals.lock().await;
        connected
            .get(&device_id)
            .cloned()
            .ok_or_else(|| "Device not connected".to_string())?
    };

    match read_characteristic_inner(&peripheral, &service_uuid, &characteristic_uuid).await {
        Ok(data) => Ok(data),
        Err(error) if is_channel_closed(&error) => {
            state.recover().await;
            Err(error)
        }
        Err(error) => Err(error),
    }
}

#[tauri::command]
pub async fn ble_write_characteristic(
    device_id: String,
    service_uuid: String,
    characteristic_uuid: String,
    data: Vec<u8>,
    write_without_response: Option<bool>,
    state: State<'_, BleState>,
) -> Result<(), String> {
    let peripheral = {
        let connected = state.connected_peripherals.lock().await;
        connected
            .get(&device_id)
            .cloned()
            .ok_or_else(|| "Device not connected".to_string())?
    };

    match write_characteristic_inner(
        &peripheral,
        &service_uuid,
        &characteristic_uuid,
        &data,
        write_without_response.unwrap_or(false),
    )
    .await
    {
        Ok(()) => Ok(()),
        Err(error) if is_channel_closed(&error) => {
            state.recover().await;
            Err(error)
        }
        Err(error) => Err(error),
    }
}

#[tauri::command]
pub async fn ble_subscribe_notifications(
    app: AppHandle,
    device_id: String,
    service_uuid: String,
    characteristic_uuid: String,
    state: State<'_, BleState>,
) -> Result<(), String> {
    // Clone the handle and release the map lock before `notification_tasks` is
    // taken below. Holding `connected_peripherals` across that second lock
    // inverts the order used by ble_unsubscribe_notifications, which takes
    // `notification_tasks` first; interleaving the two then parks both tasks
    // forever and every later BLE command queues behind them.
    let peripheral = {
        let connected = state.connected_peripherals.lock().await;
        connected
            .get(&device_id)
            .ok_or_else(|| "Device not connected".to_string())?
            .clone()
    };

    {
        let services = peripheral.services();
        let mut found = false;
        for service in &services {
            if service.uuid.to_string() == service_uuid
                || service
                    .uuid
                    .to_string()
                    .contains(&service_uuid.trim_start_matches("0000").trim_end_matches("-0000-1000-8000-00805f9b34fb"))
            {
                for c in &service.characteristics {
                    let cuuid = c.uuid.to_string();
                    if cuuid == characteristic_uuid
                        || cuuid.contains(
                            characteristic_uuid
                                .trim_start_matches("0000")
                                .trim_end_matches("-0000-1000-8000-00805f9b34fb"),
                        )
                    {
                        peripheral
                            .subscribe(&c)
                            .await
                            .map_err(|e| format!("Subscribe failed: {}", e))?;
                        found = true;
                        break;
                    }
                }
            }
        }
        if !found {
            return Err("Characteristic not found".into());
        }
    }

    let p2 = peripheral.clone();
    let dev_id = device_id.clone();
    let char_uuid = characteristic_uuid.clone();

    // Cancel any existing notification task for this characteristic
    {
        let mut tasks = state.notification_tasks.lock().await;
        if let Some(cancel_tx) = tasks.remove(&format!("{}-{}", dev_id, char_uuid)) {
            let _ = cancel_tx.send(());
        }
    }

    let (cancel_tx, mut cancel_rx) = tokio::sync::oneshot::channel::<()>();
    {
        let mut tasks = state.notification_tasks.lock().await;
        tasks.insert(format!("{}-{}", dev_id, char_uuid), cancel_tx);
    }

    let event_name = format!("ble-notification-{}-{}", device_id, characteristic_uuid);

    tauri::async_runtime::spawn(async move {
        // A disconnect racing this spawn makes notifications() fail; log and
        // stop instead of panicking the runtime task.
        let mut notification_stream = match p2.notifications().await {
            Ok(stream) => stream,
            Err(err) => {
                log::warn!("BLE notification stream unavailable: {}", err);
                return;
            }
        };
        let target_char = char_uuid.clone();

        loop {
            tokio::select! {
                notification = notification_stream.next() => {
                    if let Some(notification) = notification {
                        let char_uuid_match = notification.uuid.to_string();
                        if char_uuid_match == target_char
                            || char_uuid_match.contains(
                                target_char.trim_start_matches("0000")
                                    .trim_end_matches("-0000-1000-8000-00805f9b34fb")
                            )
                        {
                            let _ = app.emit(&event_name, &notification.value);
                        }
                    } else {
                        break;
                    }
                }
                _ = &mut cancel_rx => {
                    break;
                }
            }
        }
    });

    Ok(())
}

#[tauri::command]
pub async fn ble_unsubscribe_notifications(
    device_id: String,
    characteristic_uuid: String,
    state: State<'_, BleState>,
) -> Result<(), String> {
    {
        let mut tasks = state.notification_tasks.lock().await;
        if let Some(cancel_tx) = tasks.remove(&format!("{}-{}", device_id, characteristic_uuid))
        {
            let _ = cancel_tx.send(());
        }
    }

    let connected = state.connected_peripherals.lock().await;
    if let Some(peripheral) = connected.get(&device_id) {
        let services = peripheral.services();
        for service in &services {
            for c in &service.characteristics {
                let cuuid = c.uuid.to_string();
                if cuuid == characteristic_uuid
                    || cuuid.contains(
                        characteristic_uuid
                            .trim_start_matches("0000")
                            .trim_end_matches("-0000-1000-8000-00805f9b34fb"),
                    )
                {
                    let _ = peripheral.unsubscribe(&c).await;
                    return Ok(());
                }
            }
        }
    }
    Ok(())
}

#[tauri::command]
pub async fn ble_disconnect(
    app: AppHandle,
    device_id: String,
    state: State<'_, BleState>,
) -> Result<(), String> {
    let mut tasks = state.notification_tasks.lock().await;
    let keys_to_cancel: Vec<String> = tasks
        .keys()
        .filter(|k| k.starts_with(&format!("{}-", device_id)))
        .cloned()
        .collect();
    for key in keys_to_cancel {
        if let Some(cancel_tx) = tasks.remove(&key) {
            let _ = cancel_tx.send(());
        }
    }
    drop(tasks);

    let mut connected = state.connected_peripherals.lock().await;
    if let Some(peripheral) = connected.remove(&device_id) {
        if peripheral.is_connected().await.map_err(|e| e.to_string())? {
            peripheral.disconnect().await.map_err(|e| e.to_string())?;
        }
    }

    let _ = app.emit(&format!("ble-disconnected-{}", device_id), ());
    Ok(())
}

#[tauri::command]
pub async fn ble_is_connected(
    device_id: String,
    state: State<'_, BleState>,
) -> Result<bool, String> {
    let peripheral = {
        let connected = state.connected_peripherals.lock().await;
        connected.get(&device_id).cloned()
    };

    match peripheral {
        Some(peripheral) => peripheral.is_connected().await.map_err(|e| e.to_string()),
        None => Ok(false),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn detects_channel_closed_errors() {
        assert!(is_channel_closed("Channel closed"));
        assert!(is_channel_closed("Read failed: Channel closed"));
        assert!(!is_channel_closed("Device not connected"));
    }

    #[test]
    fn matches_full_and_short_uuids() {
        assert!(uuid_matches(
            "34c2e3bb-34aa-11eb-adc1-0242ac120002",
            "34c2e3bb-34aa-11eb-adc1-0242ac120002"
        ));
        assert!(uuid_matches(
            "00002a19-0000-1000-8000-00805f9b34fb",
            "2a19"
        ));
        assert!(!uuid_matches(
            "00002a19-0000-1000-8000-00805f9b34fb",
            "2a18"
        ));
    }
}
