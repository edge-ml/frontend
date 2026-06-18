use tauri::State;
use std::sync::Arc;
use tokio::sync::Mutex;

#[cfg(target_os = "macos")]
use btleplug::api::{Central, Manager, Peripheral, ScanFilter};
#[cfg(target_os = "macos")]
use btleplug::platform::Adapter;

struct BluetoothState {
    #[cfg(target_os = "macos")]
    adapter: Arc<Mutex<Option<Adapter>>>,
    #[cfg(not(target_os = "macos"))]
    _marker: std::marker::PhantomData<()>,
    devices: Arc<Mutex<Vec<String>>>,
}

#[tauri::command]
async fn bluetooth_scan(state: State<'_, BluetoothState>) -> Result<Vec<String>, String> {
    #[cfg(target_os = "macos")]
    {
        let adapter_lock = state.adapter.lock().await;
        let adapter = adapter_lock.as_ref().ok_or("Bluetooth adapter not initialized")?;
        
        let mut devices = state.devices.lock().await;
        devices.clear();
        
        adapter.start_scan(ScanFilter::default())
            .await
            .map_err(|e| e.to_string())?;
        
        tokio::time::sleep(tokio::time::Duration::from_secs(3)).await;
        
        let peripherals = adapter.peripherals().await.map_err(|e| e.to_string())?;
        
        for peripheral in peripherals {
            if let Ok(props) = peripheral.properties().await {
                if let Some(name) = props.and_then(|p| p.local_name) {
                    devices.push(name);
                }
            }
        }
        
        Ok(devices.clone())
    }
    
    #[cfg(not(target_os = "macos"))]
    {
        Ok(vec!["Demo Device".to_string()])
    }
}

#[tauri::command]
async fn bluetooth_connect(device_name: String, _state: State<'_, BluetoothState>) -> Result<(), String> {
    println!("Connecting to device: {}", device_name);
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let bluetooth_state = BluetoothState {
        #[cfg(target_os = "macos")]
        adapter: Arc::new(Mutex::new(None)),
        #[cfg(not(target_os = "macos"))]
        _marker: std::marker::PhantomData,
        devices: Arc::new(Mutex::new(Vec::new())),
    };
    
    #[cfg(target_os = "macos")]
    let adapter_init = {
        let adapter_clone = bluetooth_state.adapter.clone();
        move || {
            tauri::async_runtime::spawn(async move {
                if let Ok(manager) = btleplug::platform::Manager::new().await {
                    if let Ok(adapters) = manager.adapters().await {
                        if !adapters.is_empty() {
                            let mut adapter_lock = adapter_clone.lock().await;
                            *adapter_lock = Some(adapters[0].clone());
                        }
                    }
                }
            });
        }
    };
    
    #[cfg(not(target_os = "macos"))]
    let adapter_init = || {};
    
    tauri::Builder::default()
        .manage(bluetooth_state)
        .setup(|app| {
            adapter_init();
            
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![bluetooth_scan, bluetooth_connect])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
