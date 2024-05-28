import { Button, Input, InputGroup, InputGroupText } from 'reactstrap';
import ClassificationDevice from './ClassificationDevice';
import { useState } from 'react';

const CLASSIFICATION_SERVICE_UUID_DEFAULT =
  '6E400001-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase();
const CLASSIFICATION_CHARACTERISTICS_UUID_DEFAULT =
  '3c6e98a5-f027-49aa-8b2e-c7b3f8a9c18c'.toLowerCase();

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
      console.log('Connecting');
      const options = {
        filters: [{ services: [classification_service_uuid] }],
      };
      const device = await navigator.bluetooth.requestDevice(options);
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(
        classification_service_uuid,
      );
      const characteristic = await service.getCharacteristic(
        classification_characteristics_uuid,
      );
      const classificationDevice = new ClassificationDevice(
        device,
        characteristic,
      );

      device.addEventListener('gattserverdisconnected', handleDisconnect);
      setBLEDevice(classificationDevice);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="w-100 h-100 d-flex justify-content-center">
      <div className="m-5 w-100 d-flex justify-content-center align-items-center flex-column">
        <div className="w-75 m-5 d-flex flex-column align-items-center">
          <h5 className="font-weight-bold">1. Select the correct UUIDs</h5>
          <InputGroup>
            <InputGroupText>Service UUID</InputGroupText>
            <Input
              onChange={(e) => set_classification_service_uuid(e.target.value)}
              value={classification_service_uuid}
              placeholder={classification_service_uuid}
            />
          </InputGroup>
          <InputGroup>
            <InputGroupText>Characteristic UUID</InputGroupText>
            <Input
              onChange={(e) =>
                set_classification_characteristics_uuid(e.target.value)
              }
              value={classification_characteristics_uuid}
              placeholder={CLASSIFICATION_CHARACTERISTICS_UUID_DEFAULT}
            />
          </InputGroup>
        </div>
        <h5 className="m-5 font-weight-bold">
          2. Make sure your MCU is equipped with the model <b>{model.name}</b>
        </h5>
        <div className="m-5 d-flex flex-column align-items-center">
          <h5 className="font-weight-bold">
            3. Connect your MCU over BLE here:
          </h5>
          <Button className="btn-neutral" size="lg" onClick={onClickConnect}>
            Connect
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SetUpBLEConnection;
