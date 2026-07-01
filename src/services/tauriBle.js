import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

const isTauri = () =>
  Boolean(globalThis.isTauri || globalThis.__TAURI_INTERNALS__);

class TauriBluetoothCharacteristic {
  constructor(deviceId, serviceUuid, uuid, properties) {
    this.deviceId = deviceId;
    this.serviceUuid = serviceUuid;
    this.uuid = uuid;
    this.properties = properties;
    this._eventListeners = new Map();
    this._notificationsStarted = false;
    this._unlisten = null;
  }

  async readValue() {
    const data = await invoke("ble_read_characteristic", {
      deviceId: this.deviceId,
      serviceUuid: this.serviceUuid,
      characteristicUuid: this.uuid,
    });
    const uint8 = new Uint8Array(data);
    return uint8.buffer;
  }

  async writeValue(buffer) {
    const data = Array.from(new Uint8Array(buffer));
    await invoke("ble_write_characteristic", {
      deviceId: this.deviceId,
      serviceUuid: this.serviceUuid,
      characteristicUuid: this.uuid,
      data,
      writeWithoutResponse: !this.properties.includes("write"),
    });
  }

  async startNotifications() {
    if (this._notificationsStarted) return;
    this._notificationsStarted = true;

    await invoke("ble_subscribe_notifications", {
      deviceId: this.deviceId,
      serviceUuid: this.serviceUuid,
      characteristicUuid: this.uuid,
    });

    const eventName = `ble-notification-${this.deviceId}-${this.uuid}`;
    this._unlisten = await listen(eventName, (event) => {
      const uint8 = new Uint8Array(event.payload);
      const buffer = uint8.buffer;
      const dataView = new DataView(buffer);
      const fakeEvent = {
        target: {
          value: dataView,
        },
      };
      const handlers = this._eventListeners.get("characteristicvaluechanged") || [];
      handlers.forEach((fn) => fn(fakeEvent));
    });
  }

  async stopNotifications() {
    if (!this._notificationsStarted) return;
    this._notificationsStarted = false;
    if (this._unlisten) {
      this._unlisten();
      this._unlisten = null;
    }
    await invoke("ble_unsubscribe_notifications", {
      deviceId: this.deviceId,
      serviceUuid: this.serviceUuid,
      characteristicUuid: this.uuid,
    });
  }

  addEventListener(event, handler) {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, []);
    }
    this._eventListeners.get(event).push(handler);
  }

  removeEventListener(event, handler) {
    const handlers = this._eventListeners.get(event);
    if (handlers) {
      const idx = handlers.indexOf(handler);
      if (idx !== -1) handlers.splice(idx, 1);
    }
  }
}

class TauriBluetoothGATTService {
  constructor(deviceId, uuid, characteristics) {
    this.deviceId = deviceId;
    this.uuid = uuid;
    this._characteristics = characteristics || [];
  }

  async getCharacteristic(uuid) {
    for (const c of this._characteristics) {
      if (c.uuid === uuid || c.uuid.endsWith(uuid)) {
        return new TauriBluetoothCharacteristic(
          this.deviceId,
          this.uuid,
          c.uuid,
          c.properties
        );
      }
    }

    const match = this._characteristics.find((c) => {
      const short = c.uuid.replace(/-0000-1000-8000-00805f9b34fb$/, "");
      const targetShort = uuid.replace(/-0000-1000-8000-00805f9b34fb$/, "");
      return short === targetShort || c.uuid === targetShort;
    });
    if (match) {
      return new TauriBluetoothCharacteristic(
        this.deviceId,
        this.uuid,
        match.uuid,
        match.properties
      );
    }

    throw new DOMException(`Characteristic ${uuid} not found`);
  }
}

class TauriBluetoothGATTServer {
  constructor(deviceId) {
    this.deviceId = deviceId;
    this.connected = false;
    this._services = null;
  }

  async connect() {
    if (this.connected && this._services) {
      return this;
    }
    const services = await invoke("ble_connect", {
      deviceId: this.deviceId,
    });
    this.connected = true;
    this._services = services.map(
      (s) =>
        new TauriBluetoothGATTService(this.deviceId, s.uuid, s.characteristics)
    );
    return this;
  }

  disconnect() {
    this.connected = false;
    invoke("ble_disconnect", { deviceId: this.deviceId });
  }

  async getPrimaryService(uuid) {
    if (!this._services) throw new Error("Not connected");
    const fullUuid = uuid.length <= 8
      ? `${uuid}-0000-1000-8000-00805f9b34fb`
      : uuid;
    for (const s of this._services) {
      if (
        s.uuid === fullUuid ||
        s.uuid.endsWith(uuid) ||
        uuid.endsWith(s.uuid)
      ) {
        return s;
      }
    }
    throw new DOMException(`Service ${uuid} not found`);
  }

  async getPrimaryServices() {
    if (!this._services) throw new Error("Not connected");
    return this._services;
  }
}

class TauriBluetoothDevice {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.gatt = new TauriBluetoothGATTServer(id);
    this._eventListeners = new Map();
    this._disconnectUnlisten = null;
    this._setupDisconnectListener();
  }

  async _setupDisconnectListener() {
    if (!isTauri()) return;
    try {
      this._disconnectUnlisten = await listen(
        `ble-disconnected-${this.id}`,
        () => {
          this.gatt.connected = false;
          const handlers = this._eventListeners.get("gattserverdisconnected") || [];
          handlers.forEach((fn) => fn({}));
        }
      );
    } catch (e) {
    }
  }

  addEventListener(event, handler) {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, []);
    }
    this._eventListeners.get(event).push(handler);
  }

  removeEventListener(event, handler) {
    const handlers = this._eventListeners.get(event);
    if (handlers) {
      const idx = handlers.indexOf(handler);
      if (idx !== -1) handlers.splice(idx, 1);
    }
  }
}

let _pendingDeviceResolver = null;
let _pendingDeviceRejecter = null;

export function resolveDeviceSelection(device) {
  if (_pendingDeviceResolver) {
    _pendingDeviceResolver(device);
    _pendingDeviceResolver = null;
    _pendingDeviceRejecter = null;
  }
}

export function rejectDeviceSelection(err) {
  if (_pendingDeviceRejecter) {
    _pendingDeviceRejecter(err);
    _pendingDeviceResolver = null;
    _pendingDeviceRejecter = null;
  }
}

class TauriBluetooth {
  constructor() {
    this._scanPromise = null;
  }

  async requestDevice(options) {
    console.log("[TauriBle] requestDevice called with options:", options);
    const devices = await this._doScan(options);
    console.log("[TauriBle] scan returned devices:", devices);
    if (devices.length === 0) {
      throw new DOMException("No devices found");
    }

    if (devices.length === 1) {
      return new TauriBluetoothDevice(devices[0].id, devices[0].name);
    }

    return new Promise((resolve, reject) => {
      _pendingDeviceResolver = (device) => {
        resolve(new TauriBluetoothDevice(device.id, device.name));
      };
      _pendingDeviceRejecter = (err) => {
        reject(err);
      };

      window.dispatchEvent(
        new CustomEvent("tauri-ble-device-picker", {
          detail: { devices },
        })
      );
    });
  }

  async _doScan(options) {
    const result = await invoke("ble_scan");
    return result;
  }
}

let tauriBluetoothInstance = null;

export function getTauriBluetooth() {
  if (!tauriBluetoothInstance) {
    console.log("[TauriBle] Creating TauriBluetooth singleton");
    tauriBluetoothInstance = new TauriBluetooth();
  }
  return tauriBluetoothInstance;
}

export function isTauriBluetoothAvailable() {
  const available = isTauri();
  return available;
}
