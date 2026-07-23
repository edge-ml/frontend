import React, { useEffect, useState } from "react";
import { Switch, TextInput, Table } from "@mantine/core";

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
    <Table style={{ margin: "0.5rem", width: "400px" }}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>
            <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <div>Use BLE</div>
              <Switch
                style={{ marginLeft: "0.5rem" }}
                onChange={(e) => setUseBLE(!useBLE)}
                checked={useBLE}
              />
            </div>
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <Table.Tr>
          <Table.Td>
            <div style={{ display: "flex", padding: "0.5rem", alignItems: "center" }}>
              <div style={{ fontWeight: 700, width: "200px" }}>
                Service-UUID
              </div>
              <TextInput
                onChange={(e) => setServiceUUID(e.target.value)}
                disabled={!useBLE}
                value={serviceUUID}
              />
            </div>
          </Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Td>
            <div style={{ display: "flex", padding: "0.5rem", alignItems: "center" }}>
              <div style={{ fontWeight: 700, width: "200px" }}>
                Characteristic-UUID
              </div>
              <TextInput
                onChange={(e) => setCharacteristicUUID(e.target.value)}
                disabled={!useBLE}
                value={characteristicUUID}
              />
            </div>
          </Table.Td>
        </Table.Tr>
      </Table.Tbody>
    </Table>
  );
};

export default BLEDeploy;
