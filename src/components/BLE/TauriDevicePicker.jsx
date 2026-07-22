import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Loader,
} from "@mantine/core";
import {
  resolveDeviceSelection,
  rejectDeviceSelection,
} from "../../services/tauriBle";

const TauriDevicePicker = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const handler = (event) => {
      setDevices(event.detail.devices);
      setSelectedId(null);
      setIsOpen(true);
    };

    window.addEventListener("tauri-ble-device-picker", handler);
    return () => window.removeEventListener("tauri-ble-device-picker", handler);
  }, []);

  const handleConnect = () => {
    if (!selectedId) return;
    const device = devices.find((d) => d.id === selectedId);
    if (device) {
      setIsOpen(false);
      resolveDeviceSelection(device);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    rejectDeviceSelection(new DOMException("Device selection cancelled"));
  };

  return (
    <Modal opened={isOpen} onClose={handleCancel} size="lg" title="Select BLE Device">
      <Modal.Body>
        <p className="text-muted small mb-3">
          Found {devices.length} device{devices.length !== 1 ? "s" : ""}.
          Select one to connect.
        </p>
        {devices.length === 0 ? (
          <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
            <Loader size="sm" style={{ marginRight: "0.5rem" }} />
            Scanning...
          </div>
        ) : (
          <div className="list-group">
            {devices.map((d) => (
              <button
                key={d.id}
                type="button"
                className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                  selectedId === d.id ? "active" : ""
                }`}
                onClick={() => setSelectedId(d.id)}
              >
                <span>
                  <strong>{d.name || "Unknown"}</strong>
                  <br />
                  <small className="text-muted">{d.id}</small>
                </span>
                {selectedId === d.id && <span>&#10003;</span>}
              </button>
            ))}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline" color="gray" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          color="blue"
          onClick={handleConnect}
          disabled={!selectedId}
        >
          Connect
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TauriDevicePicker;
