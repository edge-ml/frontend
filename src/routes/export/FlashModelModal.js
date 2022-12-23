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
      deviceInfo: undefined,
      uploadState: 'start', //start, compileFirmware, dfuInProgress, uploadFinished
    };

    // Global vars to manage ble connnection
    this.sensorServiceUuid = '34c2e3bb-34aa-11eb-adc1-0242ac120002';
    this.deviceInfoServiceUuid = '45622510-6468-465a-b141-0b9b0f96b468';
    this.deviceIdentifierUuid = '45622511-6468-465a-b141-0b9b0f96b468';
    this.deviceGenerationUuid = '45622512-6468-465a-b141-0b9b0f96b468';
    this.dfuServiceUuid = '34c2e3b8-34aa-11eb-adc1-0242ac120002';
    this.dfuInternalCharacteristic = '34c2e3b9-34aa-11eb-adc1-0242ac120002';
    this.dfuExternalCharacteristic = '34c2e3ba-34aa-11eb-adc1-0242ac120002';
    this.gattDFUService = undefined;
    this.dfuCharacteristic = undefined;
    this.textEncoder = new TextDecoder('utf-8');

    this.arrayFW = null;
    this.fwLen = null;
    this.bytesArray = new Uint8Array(235);
    this.dataLen = 232;
    this.iterations = 0;
    this.spareBytes = 0;
    this.updateIndex = 0;
    this.crc8bit = 0;
    this.onlyCRCleft = false;
    this.crc8 = this.crc8.bind(this);
    this.update = this.update.bind(this);
    this.increaseIndex = this.increaseIndex.bind(this);
    this.updateFW = this.updateFW.bind(this);
    this.init = this.init.bind(this);
    this.renderProgressInfo = this.renderProgressInfo.bind(this);

    this.connectDevice = this.connectDevice.bind(this);
    this.onDisconnection = this.onDisconnection.bind(this);
  }

  componentWillUnmount() {
    if (
      this.state.connectedBLEDevice &&
      this.state.connectedBLEDevice.gatt &&
      this.state.connectedBLEDevice.gatt.disconnect
    ) {
      this.state.connectedBLEDevice.removeEventListener(
        'gattserverdisconnected',
        this.onDisconnection
      );
    }
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
    const deviceGenerationCharacteristic =
      await deviceInfoService.getCharacteristic(this.deviceGenerationUuid);

    const deviceIdentifierArrayBuffer =
      await deviceIdentifierCharacteristic.readValue();
    const deviceGenerationArrayBuffer =
      await deviceGenerationCharacteristic.readValue();
    const deviceName = this.textEncoder.decode(deviceIdentifierArrayBuffer);

    const deviceGeneration = this.textEncoder.decode(
      deviceGenerationArrayBuffer
    );

    const deviceInfo = await getDeviceByNameAndGeneration(
      deviceName,
      deviceGeneration
    );
    this.setState({
      connectedBLEDevice: bleDevice,
      deviceInfo: deviceInfo.device,
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
      return this.state.deviceInfo.name;
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
      this.state.connectedBLEDevice.removeEventListener(
        'gattserverdisconnected',
        this.onDisconnection
      );
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

  init(arrayBuffer) {
    this.arrayFW = new Uint8Array(arrayBuffer);
    this.fwLen = this.arrayFW.length;

    console.log('Binary file length: ', this.fwLen);
    if (this.debug == true) {
      console.log(this.arrayFW);
    }
    this.crc8();
    console.log('Computed 8-bit CRC: ', this.crc8bit);
    console.log('Press "Update" button to start the fw update');
  }

  crc8() {
    var i;
    this.crc8bit = this.arrayFW[0];
    for (i = 1; i < this.fwLen; i++) {
      this.crc8bit = this.crc8bit ^ this.arrayFW[i];
    }
  }

  async connectGATTdfu() {
    return this.props.connectedBLEDevice.gatt
      .connect()
      .then((server) => {
        console.log('BLE device connected!');
        if (this.debug == true) {
          console.log('Getting server:', server);
        }
        return server.getPrimaryService(this.dfuService);
      })
      .then((service) => {
        this.gattService = service;
        if (this.debug == true) {
          console.log('Getting service:', service);
        }
        return service.getCharacteristic(this.dfuInternalCharacteristic);
      })
      .then((characteristic) => {
        this.gattInternalCharacteristic = characteristic;
        if (this.debug == true) {
          console.log('Looking for characteristic...');
          console.log(
            'dfu internal characteristic:',
            this.gattInternalCharacteristic
          );
        }
      })
      .then((_) => {
        return this.gattService.getCharacteristic(
          this.dfuExternalCharacteristic
        );
      })
      .then((characteristic) => {
        this.gattExternalCharacteristic = characteristic;
        if (this.debug == true) {
          console.log('Looking for characteristic...');
          console.log(
            'dfu external characteristic:',
            this.gattExternalCharacteristic
          );
        }
      });
  }

  update(index) {
    //clearTimeout(dfuTimeout);
    if (this.debug == true) {
      console.log(index);
    }

    var filePtr = this.dataLen * index;
    if (index == this.iterations - 1) {
      //Last byte
      this.bytesArray[0] = 1;
      var bytesleft = this.spareBytes + 1; //add CRC to the count
      if (this.debug == true) {
        console.log('Packaging last byte with CRC');
        console.log('Total bytes left: ', this.bytesleft);
      }
      var spare = new Uint8Array([
        bytesleft & 0x00ff,
        (bytesleft & 0xff00) >> 8,
      ]);
      this.bytesArray.set(spare, 1);

      if (!this.onlyCRCleft) {
        this.bytesArray.set(
          this.arrayFW.slice(filePtr, filePtr + this.spareBytes),
          3
        );
      }

      var crc = new Uint8Array([
        (this.crc8bit & 0xff00) >> 8,
        this.crc8bit & 0x00ff,
      ]);

      if (this.debug == true) {
        console.log('crc[0]: ', crc[0]);
        console.log('crc[1]: ', crc[1]);
      }

      //write CRC after the spare bytes
      this.bytesArray[3 + this.spareBytes] = crc[1];

      //Fill with 0s the remaining buffer
      var lastBytes = new Uint8Array(this.dataLen - this.spareBytes - 1).fill(
        0
      );
      this.bytesArray.set(lastBytes, 3 + this.spareBytes + 1);
    } else {
      var index_byte = new Uint8Array([index & 0x00ff, (index & 0xff00) >> 8]);

      this.bytesArray[0] = 0;
      this.bytesArray.set(index_byte, 1);
      this.bytesArray.set(
        this.arrayFW.slice(filePtr, filePtr + this.dataLen),
        3
      );
    }
    console.log(this.bytesArray);
    console.log('Writing 67 bytes array...');
    this.dfuCharacteristic.writeValue(this.bytesArray).then((_) => {
      //show on Progress bar
      this.setState({ progress: (index / (this.iterations - 1)) * 100 });

      this.increaseIndex();
      if (this.debug == true) {
        console.log('Written');
      }
    });
  }

  increaseIndex() {
    if (this.updateIndex < this.iterations - 1) {
      this.updateIndex++;
      this.update(this.updateIndex);
    } else {
      console.log('firmware sent');
      this.setState({ uploadState: 'uploadFinished' });
      return;
    }
  }

  async updateFW() {
    this.setState({ uploadState: 'dfuInProgress' });
    this.iterations = Math.floor(this.fwLen / this.dataLen);
    this.spareBytes = this.fwLen % this.dataLen;
    this.iterations++;
    if (this.debug == true) {
      console.log('Iterations: ', this.iterations);
      console.log('Spare bytes: ', this.spareBytes);
    }
    if (this.spareBytes == 0) {
      if (this.debug == true) {
        console.log('No remaining bytes in last packet to write CRC.');
        console.log('CRC will be sent alone in a new packet');
      }
      this.onlyCRCleft = true;
    }
    this.updateIndex = 0;
    // Take selected dfu characteristic
    //nicla
    this.dfuCharacteristic = this.gattInternalCharacteristic;
    this.update(this.updateIndex);
  }

  async downLoadAndInstallFW() {
    this.getCompiledFirmware()
      .then((arrayBuffer) => {
        this.init(arrayBuffer);
        this.updateFW();
      })
      .catch((err) => console.log(err));
  }

  renderProgressInfo(uploadState) {
    switch (uploadState) {
      case 'start':
        return 'Update has not started yet';
      case 'compileFirmware':
        return 'Compiling firmware...';
      case 'dfuInProgress':
        return 'Flashing firmware over BLE...';
      case 'uploadFinished':
        return 'The firmware update is completed';
    }
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
              <div className="panelDivider"></div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  You can automatically compile and then install the selected
                  firmware on the device by clicking on the install button.
                </div>
                <Button
                  color="primary"
                  disabled={
                    this.state.uploadState === 'compileFirmware' ||
                    this.state.uploadState === 'dfuInProgress' ||
                    !this.state.connectedBLEDevice
                  }
                  onClick={this.downLoadAndInstallFW}
                >
                  Install
                </Button>
              </div>
              <div className="panelDivider"></div>

              <div className="mt-3">
                <Progress
                  color={
                    this.state.uploadState === 'uploadFinished'
                      ? 'primary'
                      : 'success'
                  }
                  value={this.state.progress}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {this.renderProgressInfo(this.state.uploadState)}
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
            <Button
              color="danger"
              onClick={this.props.closeFlashModal}
              disabled={
                this.state.uploadState === 'compileFirmware' ||
                this.state.uploadState === 'dfuInProgress'
              }
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default FlashModelModal;
