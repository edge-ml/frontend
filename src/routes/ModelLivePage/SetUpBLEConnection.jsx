import React from "react";
import { Button, Group, Stack, Text, TextInput, Title } from "@mantine/core";
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
    <Group justify="center" align="center" style={{ width: "100%", height: "100%" }}>
      <Stack align="center" gap="xl" style={{ width: "100%" }}>
        <Stack align="center" gap="sm" style={{ width: "75%" }}>
          <Title order={5}>1. Select the correct UUIDs</Title>
          <TextInput
            label="Service UUID"
            onChange={(e) => set_classification_service_uuid(e.target.value)}
            value={classification_service_uuid}
            placeholder={classification_service_uuid}
            w="100%"
          />
          <TextInput
            label="Characteristic UUID"
            onChange={(e) =>
              set_classification_characteristics_uuid(e.target.value)
            }
            value={classification_characteristics_uuid}
            placeholder={CLASSIFICATION_CHARACTERISTICS_UUID_DEFAULT}
            w="100%"
          />
        </Stack>
        <Text fw={700} size="lg">
          2. Make sure your MCU is equipped with the model <b>{model.name}</b>
        </Text>
        <Stack align="center" gap="sm">
          <Title order={5}>3. Connect your MCU over BLE here:</Title>
          <Button variant="outline" size="lg" onClick={onClickConnect}>
            Connect
          </Button>
        </Stack>
      </Stack>
    </Group>
  );
};

export default SetUpBLEConnection;
