import React, { Component } from 'react';
import {
  ModalHeader,
  Button,
  Progress,
  Spinner,
  Modal,
  ModalBody,
  ModalFooter,
} from 'reactstrap';

import { getDeviceByNameAndGeneration } from '../../services/ApiServices/DeviceService';

var apiConsts = require('../../services/ApiServices/ApiConstants');

class FlashModelModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      connectedBLEDevice: undefined,
      bleStatus: navigator.bluetooth,
      deviceName: undefined,
      uploadState: 'start', //start, compileFile, dfuInProgress, uploadFinished
    };

    // Global vars to manage ble connnection
    this.sensorServiceUuid = '34c2e3bb-34aa-11eb-adc1-0242ac120002';
    this.deviceInfoServiceUuid = '45622510-6468-465a-b141-0b9b0f96b468';
    this.deviceIdentifierUuid = '45622511-6468-465a-b141-0b9b0f96b468';
    this.dfuServiceUuid = '34c2e3b8-34aa-11eb-adc1-0242ac120002';
    this.dfuInternalCharacteristic = '34c2e3b9-34aa-11eb-adc1-0242ac120002';
    this.dfuExternalCharacteristic = '34c2e3ba-34aa-11eb-adc1-0242ac120002';
    this.gattDFUService = undefined;
    this.dfuCharacteristic = undefined;
    this.textEncoder = new TextDecoder('utf-8');

    this.connectDevice = this.connectDevice.bind(this);
    this.onDisconnection = this.onDisconnection.bind(this);
  }

  componentWillUnmount() {
    this.onDisconnection();
  }

  async connectDevice() {
    let options = {
      filters: [
        { services: [this.dfuServiceUuid, this.deviceInfoServiceUuid] },
      ],
      optionalServices: [this.sensorServiceUuid],
    };
    const bleDevice = await navigator.bluetooth.requestDevice(options);
    bleDevice.addEventListener('gattserverdisconnected', this.onDisconnection);

    const dfuService = await bleDevice.gatt.connect().then((server) => {
      return server.getPrimaryService(this.dfuServiceUuid);
    });

    this.gattDFUService = await dfuService.getCharacteristic(
      this.dfuInternalCharacteristic
    );

    const deviceInfoService = await bleDevice.gatt.connect().then((server) => {
      return server.getPrimaryService(this.deviceInfoServiceUuid);
    });
    const deviceIdentifierCharacteristic =
      await deviceInfoService.getCharacteristic(this.deviceIdentifierUuid);
    //const deviceGenerationCharacteristic =
    //  await deviceInfoService.getCharacteristic(this.deviceGenerationUuid);

    const deviceIdentifierArrayBuffer =
      await deviceIdentifierCharacteristic.readValue();
    //const deviceGenerationArrayBuffer =
    //  await deviceGenerationCharacteristic.readValue();
    const deviceName = this.textEncoder.decode(deviceIdentifierArrayBuffer);

    //const deviceGeneration = this.textEncoder.decode(
    //  deviceGenerationArrayBuffer
    //);

    //const deviceInfo = await getDeviceByNameAndGeneration(
    //  deviceName,
    //  deviceGeneration
    //);
    this.setState({
      connectedBLEDevice: bleDevice,
      deviceName: deviceName,
      //  deviceInfo: deviceInfo
    });
  }

  async getCompiledFirmware() {}

  getDownloadName() {
    switch (this.state.deviceInfo.name) {
      case 'NICLA':
        return apiConsts.COMPILE_ENDPOINTS.DEVICE_NAME_NICLA;
      case 'NANO':
        return apiConsts.COMPILE_ENDPOINTS.DEVICE_NAME_NANO33;
      case 'Seeed XIAO':
        return apiConsts.COMPILE_ENDPOINTS.DEVICE_NAME_SEEED_XIAO;
    }
  }

  renderDeviceName() {
    if (this.state.connectedBLEDevice) {
      return this.state.connectedBLEDevice.name;
    } else {
      return 'Device not connected';
    }
  }

  async onDisconnection(event) {
    if (
      this.state.connectedBLEDevice &&
      this.state.connectedBLEDevice.gatt &&
      this.state.connectedBLEDevice.gatt.disconnect
    ) {
      await this.state.connectedBLEDevice.gatt.disconnect();
    }
    this.setState({
      connectedBLEDevice: undefined,
      bleStatus: navigator.bluetooth,
      deviceName: undefined,
    });
    this.gattDFUService = undefined;
    this.dfuCharacteristic = undefined;
  }

  render() {
    return (
      <div>
        <Modal
          isOpen={this.props.flashModalState}
          className="modal-xl"
          backdrop="static"
          keyboard={false}
        >
          <ModalHeader>Flash Model</ModalHeader>
          <ModalBody>
            <div className="align-items-center">
              <div>
                Selected model to flash onto device:{' '}
                {<strong>{this.props.selectedModel.name}</strong>}
              </div>
            </div>
            <div className="align-items-center">
              <div>
                Selected BLE device:{' '}
                {<strong>{this.renderDeviceName()}</strong>}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color={this.state.connectedBLEDevice ? 'danger' : 'primary'}
              onClick={
                this.state.connectedBLEDevice
                  ? this.onDisconnection
                  : this.connectDevice
              }
            >
              {this.state.connectedBLEDevice ? 'Disconnect' : 'Conect'}
            </Button>
            <Button color="danger" onClick={this.props.closeFlashModal}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default FlashModelModal;
