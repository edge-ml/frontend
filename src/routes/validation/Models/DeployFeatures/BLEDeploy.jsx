import React, { useEffect, useState } from "react";
import {
  EdgeMLTable,
  EdgeMLTableEntry,
  EdgeMLTableHeader,
} from "../../../../components/Common/EdgeMLTable";
import { Group, Switch, Text, TextInput } from "@mantine/core";

const BLEDeploy = ({ onUpdateState }) => {
  const [useBLE, setUseBLE] = useState(false);
  const [serviceUUID, setServiceUUID] = useState(
    "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
  );
  const [characteristicUUID, setCharacteristicUUID] = useState(
    "3c6e98a5-f027-49aa-8b2e-c7b3f8a9c18c"
  );

  useEffect(() => {
    onUpdateState({
      enabled: useBLE,
      serviceUUID: serviceUUID,
      characteristicUUID: characteristicUUID,
    });
  }, [useBLE, serviceUUID, characteristicUUID]);

  return (
    <EdgeMLTable m="sm" style={{ width: "400px" }}>
      <EdgeMLTableHeader>
        <Group justify="center" align="center">
          <Text>Use BLE</Text>
          <Switch ml="sm" checked={useBLE} onChange={() => setUseBLE(!useBLE)} />
        </Group>
      </EdgeMLTableHeader>
      <EdgeMLTableEntry>
        <Group align="center" p="sm">
          <Text fw={700} style={{ width: "200px" }}>
            Service-UUID
          </Text>
          <TextInput
            onChange={(e) => setServiceUUID(e.target.value)}
            disabled={!useBLE}
            value={serviceUUID}
          />
        </Group>
      </EdgeMLTableEntry>
      <EdgeMLTableEntry>
        <Group align="center" p="sm">
          <Text fw={700} style={{ width: "200px" }}>
            Characteristic-UUID
          </Text>
          <TextInput
            onChange={(e) => setCharacteristicUUID(e.target.value)}
            disabled={!useBLE}
            value={characteristicUUID}
          />
        </Group>
      </EdgeMLTableEntry>
    </EdgeMLTable>
  );
};

export default BLEDeploy;
