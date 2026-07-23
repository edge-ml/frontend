import { invoke } from "@tauri-apps/api/core";

export async function scanBluetoothDevices() {
  try {
    const devices = await invoke("bluetooth_scan");
    return devices;
  } catch (error) {
    console.error("Failed to scan Bluetooth devices:", error);
    throw error;
  }
}

export async function connectToDevice(index) {
  try {
    await invoke("bluetooth_connect", { index });
    return true;
  } catch (error) {
    console.error("Failed to connect to device:", error);
    throw error;
  }
}
