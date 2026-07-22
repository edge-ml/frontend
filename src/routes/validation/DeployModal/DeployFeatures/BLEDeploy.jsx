import { useEffect, useState } from "react";
import {
  EdgeMLTable,
  EdgeMLTableEntry,
  EdgeMLTableHeader,
} from "../../../../components/Common/EdgeMLTable";
import { Switch, TextInput } from "@mantine/core";

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
    <EdgeMLTable style={{ margin: "0.5rem", width: "400px" }}>
      <EdgeMLTableHeader>
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <div>Use BLE</div>
          <Switch
            style={{ marginLeft: "0.5rem" }}
            onChange={(e) => setUseBLE(!useBLE)}
            checked={useBLE}
          />
        </div>
      </EdgeMLTableHeader>
      <EdgeMLTableEntry>
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
      </EdgeMLTableEntry>
      <EdgeMLTableEntry>
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
      </EdgeMLTableEntry>
    </EdgeMLTable>
  );
};

export default BLEDeploy;
