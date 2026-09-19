use btleplug::api::{Central, CharPropFlags, Manager as _, Peripheral, ScanFilter, WriteType};
use btleplug::platform::{Adapter, Manager, Peripheral as PlatformPeripheral};
use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
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

#[tauri::command]
pub async fn ble_scan(state: State<'_, BleState>) -> Result<Vec<BleDeviceInfo>, String> {
    let adapter = get_adapter(&state).await?;
    let mut peripherals_guard = state.peripherals.lock().await;
    peripherals_guard.clear();

    adapter
        .start_scan(ScanFilter::default())
        .await
        .map_err(|e| e.to_string())?;

    tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;

    adapter
        .stop_scan()
        .await
        .map_err(|e| e.to_string())?;

    let peripherals = adapter.peripherals().await.map_err(|e| e.to_string())?;
    let mut devices = Vec::new();

    for p in peripherals {
        let props = p.properties().await.map_err(|e| e.to_string())?;
        if let Some(properties) = props {
            let name = properties
                .local_name
                .unwrap_or_else(|| "Unknown".into());
            let id = p.id().to_string();
            peripherals_guard.insert(id.clone(), p);
            devices.push(BleDeviceInfo { id, name });
        }
    }

    Ok(devices)
}

#[tauri::command]
pub async fn ble_connect(
    device_id: String,
    state: State<'_, BleState>,
) -> Result<Vec<BleServiceInfo>, String> {
    let mut connected = state.connected_peripherals.lock().await;
    let peripherals = state.peripherals.lock().await;

    let peripheral = peripherals
        .get(&device_id)
        .ok_or_else(|| "Device not found. Please scan first.".to_string())?;

    if !peripheral.is_connected().await.map_err(|e| e.to_string())? {
        peripheral
            .connect()
            .await
            .map_err(|e| format!("Connect failed: {}", e))?;
    }

    peripheral
        .discover_services()
        .await
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

    connected.insert(device_id.clone(), peripherals.get(&device_id).unwrap().clone());
    Ok(service_infos)
}

#[tauri::command]
pub async fn ble_read_characteristic(
    device_id: String,
    service_uuid: String,
    characteristic_uuid: String,
    state: State<'_, BleState>,
) -> Result<Vec<u8>, String> {
    let connected = state.connected_peripherals.lock().await;
    let peripheral = connected
        .get(&device_id)
        .ok_or_else(|| "Device not connected".to_string())?;

    let services = peripheral.services();
    for service in &services {
        if service.uuid.to_string() == service_uuid || service.uuid.to_string().contains(&service_uuid.trim_start_matches("0000").trim_end_matches("-0000-1000-8000-00805f9b34fb")) {
            for c in &service.characteristics {
                let cuuid = c.uuid.to_string();
                if cuuid == characteristic_uuid || cuuid.contains(characteristic_uuid.trim_start_matches("0000").trim_end_matches("-0000-1000-8000-00805f9b34fb")) {
                    let data = peripheral
                        .read(&c)
                        .await
                        .map_err(|e| format!("Read failed: {}", e))?;
                    return Ok(data);
                }
            }
        }
    }
    Err("Characteristic not found".into())
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
    let connected = state.connected_peripherals.lock().await;
    let peripheral = connected
        .get(&device_id)
        .ok_or_else(|| "Device not connected".to_string())?;

    let services = peripheral.services();
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
                    let write_type = if write_without_response.unwrap_or(false) {
                        WriteType::WithoutResponse
                    } else {
                        WriteType::WithResponse
                    };
                    peripheral
                        .write(&c, &data, write_type)
                        .await
                        .map_err(|e| format!("Write failed: {}", e))?;
                    return Ok(());
                }
            }
        }
    }
    Err("Characteristic not found".into())
}

#[tauri::command]
pub async fn ble_subscribe_notifications(
    app: AppHandle,
    device_id: String,
    service_uuid: String,
    characteristic_uuid: String,
    state: State<'_, BleState>,
) -> Result<(), String> {
    let connected = state.connected_peripherals.lock().await;
    let peripheral = connected
        .get(&device_id)
        .ok_or_else(|| "Device not connected".to_string())?;

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

    let p2 = connected.get(&device_id).unwrap().clone();
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
        let mut notification_stream = p2.notifications().await.unwrap();
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
    let mut tasks = state.notification_tasks.lock().await;
    if let Some(cancel_tx) = tasks.remove(&format!("{}-{}", device_id, characteristic_uuid)) {
        let _ = cancel_tx.send(());
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
    let connected = state.connected_peripherals.lock().await;
    if let Some(peripheral) = connected.get(&device_id) {
        return peripheral.is_connected().await.map_err(|e| e.to_string());
    }
    Ok(false)
}
