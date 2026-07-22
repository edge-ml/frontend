import React from "react";
import { Button, TextInput } from "@mantine/core";
import ClassificationDevice from "./ClassificationDevice";
import { useState } from "react";

const CLASSIFICATION_SERVICE_UUID_DEFAULT =
  "6E400001-B5A3-F393-E0A9-E50E24DCCA9E".toLowerCase();
const CLASSIFICATION_CHARACTERISTICS_UUID_DEFAULT =
  "3c6e98a5-f027-49aa-8b2e-c7b3f8a9c18c".toLowerCase();

const SetUpBLEConnection = ({ model, setBLEDevice, onDeviceDisconnect }) => {
  const [classification_service_uuid, set_classification_service_uuid] =
    useState(CLASSIFICATION_SERVICE_UUID_DEFAULT);
  const [
    classification_characteristics_uuid,
    set_classification_characteristics_uuid,
  ] = useState(CLASSIFICATION_CHARACTERISTICS_UUID_DEFAULT);

  const handleDisconnect = () => {
    onDeviceDisconnect();
  };

  const onClickConnect = async () => {
    try {
      const options = {
        filters: [{ services: [classification_service_uuid] }],
      };
      const device = await navigator.bluetooth.requestDevice(options);
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(
        classification_service_uuid
      );
      const characteristic = await service.getCharacteristic(
        classification_characteristics_uuid
      );
      const classificationDevice = new ClassificationDevice(
        device,
        characteristic
      );

      device.addEventListener("gattserverdisconnected", handleDisconnect);
      setBLEDevice(classificationDevice);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center" }}>
      <div style={{ margin: "3rem", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
        <div style={{ width: "75%", margin: "3rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h5 style={{ fontWeight: 700 }}>1. Select the correct UUIDs</h5>
          <TextInput
            label="Service UUID"
            onChange={(e) => set_classification_service_uuid(e.target.value)}
            value={classification_service_uuid}
            placeholder={classification_service_uuid}
            style={{ width: "100%" }}
          />
          <TextInput
            label="Characteristic UUID"
            onChange={(e) =>
              set_classification_characteristics_uuid(e.target.value)
            }
            value={classification_characteristics_uuid}
            placeholder={CLASSIFICATION_CHARACTERISTICS_UUID_DEFAULT}
            style={{ width: "100%" }}
          />
        </div>
        <h5 style={{ margin: "3rem", fontWeight: 700 }}>
          2. Make sure your MCU is equipped with the model <b>{model.name}</b>
        </h5>
        <div style={{ margin: "3rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h5 style={{ fontWeight: 700 }}>3. Connect your MCU over BLE here:</h5>
          <Button
            variant="outline"
            color="blue"
            size="lg"
            onClick={onClickConnect}
          >
            Connect
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SetUpBLEConnection;
