mod ble;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .manage(ble::BleState::default())
        .invoke_handler(tauri::generate_handler![
            ble::ble_scan,
            ble::ble_connect,
            ble::ble_read_characteristic,
            ble::ble_write_characteristic,
            ble::ble_subscribe_notifications,
            ble::ble_unsubscribe_notifications,
            ble::ble_disconnect,
            ble::ble_is_connected,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
