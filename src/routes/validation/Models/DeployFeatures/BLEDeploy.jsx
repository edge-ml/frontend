import React, { useEffect, useState } from "react";
import {
  EdgeMLTable,
  EdgeMLTableEntry,
  EdgeMLTableHeader,
} from "../../../../components/Common/EdgeMLTable";
import { FormGroup, Input } from "reactstrap";

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
    <EdgeMLTable className="m-2" style={{ width: "400px" }}>
      <EdgeMLTableHeader>
        <div className="d-flex justify-content-center w-100">
          <div>Use BLE</div>
          <FormGroup style={{ margin: 0 }}>
            <Input
              className="ms-2"
              inline
              onChange={(e) => setUseBLE(!useBLE)}
              type="switch"
              id="exampleCustomSwitch"
              // checked={this.props.project.enableDeviceApi}
              // onChange={(e) => this.props.onDeviceApiSwitch(e.target.checked)}
            />
          </FormGroup>
        </div>
      </EdgeMLTableHeader>
      <EdgeMLTableEntry>
        <div className="d-flex p-2 align-items-center">
          <div className="fw-bold" style={{ width: "200px" }}>
            Service-UUID
          </div>
          <Input
            onChange={(e) => setServiceUUID(e.target.value)}
            disabled={!useBLE}
            value={serviceUUID}
          ></Input>
        </div>
      </EdgeMLTableEntry>
      <EdgeMLTableEntry>
        <div className="d-flex p-2 algin-items-center">
          <div className="fw-bold" style={{ width: "200px" }}>
            Characteristic-UUID
          </div>
          <Input
            onChange={(e) => setCharacteristicUUID(e.target.value)}
            disabled={!useBLE}
            value={characteristicUUID}
          ></Input>
        </div>
      </EdgeMLTableEntry>
    </EdgeMLTable>
  );
};

export default BLEDeploy;
