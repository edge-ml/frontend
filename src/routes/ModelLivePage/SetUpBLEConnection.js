import { Button, Toast, ToastBody, ToastHeader } from 'reactstrap';
import ClassificationDevice from './ClassificationDevice';
import { useState } from 'react';

const CLASSIFICATION_SERVICE_UUID =
  '6E400001-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase();
const CLASSIFICATION_CHARACTERISTICS_UUID =
  '3c6e98a5-f027-49aa-8b2e-c7b3f8a9c18c'.toLowerCase();

const SetUpBLEConnection = ({ model, setBLEDevice, onDeviceDisconnect }) => {
  const handleDisconnect = () => {
    onDeviceDisconnect();
  };

  const onClickConnect = async () => {
    try {
      console.log('Connecting');
      const options = {
        filters: [{ services: [CLASSIFICATION_SERVICE_UUID] }],
      };
      // const options = {acceptAllDevices: true};
      const device = await navigator.bluetooth.requestDevice(options);
      const server = await device.gatt.connect();
      console.log('Device connected');
      console.log(device.name);
      const service = await server.getPrimaryService(
        CLASSIFICATION_SERVICE_UUID,
      );
      console.log('Got server');
      const characteristic = await service.getCharacteristic(
        CLASSIFICATION_CHARACTERISTICS_UUID,
      );
      console.log('Got characterisitc');
      const classificationDevice = new ClassificationDevice(
        device,
        characteristic,
      );

      device.addEventListener('gattserverdisconnected', handleDisconnect);
      setBLEDevice(classificationDevice);
    } catch (error) {
      console.log('Got an error');
      console.error('Error:', error);
    }
  };

  return (
    <div className="w-100 h-100 d-flex justify-content-center">
      <div className="m-5 d-flex justify-content-center align-items-center flex-column">
        <h5>
          1. Make sure your MCU is equipped with the model <b>{model.name}</b>
        </h5>
        <h5>2. Connect your MCU over BLE here:</h5>
        <Button onClick={onClickConnect}>Connect</Button>
      </div>
    </div>
  );
};

export default SetUpBLEConnection;
