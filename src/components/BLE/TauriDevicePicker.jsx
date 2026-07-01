import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "reactstrap";
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
    <Modal isOpen={isOpen} toggle={handleCancel} size="lg" scrollable>
      <ModalHeader toggle={handleCancel}>Select BLE Device</ModalHeader>
      <ModalBody>
        <p className="text-muted small mb-3">
          Found {devices.length} device{devices.length !== 1 ? "s" : ""}.
          Select one to connect.
        </p>
        {devices.length === 0 ? (
          <div className="text-center py-4">
            <Spinner size="sm" className="me-2" />
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
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={handleConnect}
          disabled={!selectedId}
        >
          Connect
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default TauriDevicePicker;
