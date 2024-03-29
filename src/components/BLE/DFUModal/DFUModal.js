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
import { getArduinoFirmware } from '../../../services/ApiServices/ArduinoFirmwareServices';

class DFUModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      progress: 0,
      dfuState: 'start', //start, downloadingFW, dfuInProgress, uploadFinished
      isConnectingGATTDFU: false,
      hasError: false,
      error: undefined,
    };

    this.dfuService = '34c2e3b8-34aa-11eb-adc1-0242ac120002';
    this.dfuInternalCharacteristic = '34c2e3b9-34aa-11eb-adc1-0242ac120002';
    this.dfuExternalCharacteristic = '34c2e3ba-34aa-11eb-adc1-0242ac120002';

    this.arrayFW = null;
    this.fwLen = null;
    this.bytesArray = new Uint8Array(235);
    this.dataLen = 232;
    this.iterations = 0;
    this.spareBytes = 0;
    this.updateIndex = 0;
    //var dfuTimeout;
    this.debug = true;
    this.crc8bit = 0;
    this.onlyCRCleft = false;
    this.gattService = undefined;
    this.gattInternalCharacteristic = undefined;
    this.gattExternalCharacteristic = undefined;
    this.dfuCharacteristic = undefined;

    this.crc8 = this.crc8.bind(this);
    this.connectGATTdfu = this.connectGATTdfu.bind(this);
    this.update = this.update.bind(this);
    this.increaseIndex = this.increaseIndex.bind(this);
    this.updateFW = this.updateFW.bind(this);
    this.init = this.init.bind(this);
    this.downloadFirmware = this.downloadFirmware.bind(this);
    this.downLoadAndInstallFW = this.downLoadAndInstallFW.bind(this);
    this.renderProgressInfo = this.renderProgressInfo.bind(this);
    this.resetStateWithError = this.resetStateWithError.bind(this);
    this.renderModalBody = this.renderModalBody.bind(this);
  }

  async componentDidMount() {
    this.setState({ isConnectingGATTDFU: true });
    try {
      await this.connectGATTdfu();
    } catch (e) {
      console.log(e);
      this.resetStateWithError('Could not connect to DFU service.', e);
    }
    this.setState({ isConnectingGATTDFU: false });
  }

  resetStateWithError(msg) {
    this.setState(
      {
        hasError: true,
        error: msg,
        isConnectingGATTDFU: false,
        dfuState: 'start',
      },
      () => {
        this.props.onDisconnection();
      }
    );
  }

  init(arrayBuffer) {
    this.arrayFW = new Uint8Array(arrayBuffer);
    this.fwLen = this.arrayFW.length;

    console.log('Binary file length: ', this.fwLen);
    if (this.debug === true) {
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
        if (this.debug === true) {
          console.log('Getting server:', server);
        }
        return server.getPrimaryService(this.dfuService);
      })
      .then((service) => {
        this.gattService = service;
        if (this.debug === true) {
          console.log('Getting service:', service);
        }
        return service.getCharacteristic(this.dfuInternalCharacteristic);
      })
      .then((characteristic) => {
        this.gattInternalCharacteristic = characteristic;
        if (this.debug === true) {
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
        if (this.debug === true) {
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
    if (this.debug === true) {
      console.log(index);
    }

    var filePtr = this.dataLen * index;
    if (index === this.iterations - 1) {
      //Last byte
      this.bytesArray[0] = 1;
      var bytesleft = this.spareBytes + 1; //add CRC to the count
      if (this.debug === true) {
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

      if (this.debug === true) {
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
    this.dfuCharacteristic
      .writeValue(this.bytesArray)
      .then((_) => {
        //show on Progress bar
        this.setState({ progress: (index / (this.iterations - 1)) * 100 });

        this.increaseIndex();
        if (this.debug === true) {
          console.log('Written');
        }
      })
      .catch((e) => {
        console.log(e);
        this.resetStateWithError(
          'An error occured while sending package to BLE device'
        );
      });
  }

  increaseIndex() {
    if (this.updateIndex < this.iterations - 1) {
      this.updateIndex++;
      this.update(this.updateIndex);
    } else {
      console.log('firmware sent');
      this.setState({ dfuState: 'uploadFinished' });
      return;
    }
  }

  async updateFW() {
    this.setState({ dfuState: 'dfuInProgress' });
    this.iterations = Math.floor(this.fwLen / this.dataLen);
    this.spareBytes = this.fwLen % this.dataLen;
    this.iterations++;
    if (this.debug === true) {
      console.log('Iterations: ', this.iterations);
      console.log('Spare bytes: ', this.spareBytes);
    }
    if (this.spareBytes === 0) {
      if (this.debug === true) {
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
    this.downloadFirmware()
      .then(this.init)
      .then(this.updateFW)
      .catch((err) => {
        console.log(err);
        this.resetStateWithError(
          'An error occurred while flashing the firmware.'
        );
      });
  }

  async downloadFirmware() {
    this.setState({ dfuState: 'downloadingFW' });
    let downloadName = '';
    switch (
      this.props.connectedDeviceData
        ? this.props.connectedDeviceData.name
        : undefined
    ) {
      case 'NICLA':
        downloadName = 'nicla';
        break;
      case 'NANO':
        downloadName = 'nano';
        break;
      case 'Seeed XIAO':
        downloadName = 'xiao';
        break;
      default:
        downloadName = 'nicla';
        break;
    }
    return getArduinoFirmware(downloadName);
  }

  renderProgressInfo(dfuState) {
    switch (dfuState) {
      case 'start':
        return 'Update has not started yet';
      case 'downloadingFW':
        return 'Downloading firmware...';
      case 'dfuInProgress':
        return 'Flashing firmware over BLE...';
      case 'uploadFinished':
        return 'The firmware update is completed';
    }
  }

  renderModalBody() {
    if (this.state.hasError) {
      return <div className="text-danger">{this.state.error}</div>;
    } else {
      return this.state.isConnectingGATTDFU ? (
        <div>
          <Spinner color="primary" />
        </div>
      ) : (
        <div className="align-items-center">
          <div>
            Connected BLE device:{' '}
            {
              <strong>
                {this.props.connectedDeviceData
                  ? this.props.connectedDeviceData.name
                  : this.props.connectedBLEDevice.name}
              </strong>
            }
          </div>
          <div>
            Latest edge-ml version:{' '}
            <strong>{this.props.latestEdgeMLVersion}</strong>
          </div>
          <div>
            {this.props.isEdgeMLInstalled
              ? 'This device already has edge-ml installed, but an update is possible. Please do not close this window, while the firmware is flashing.'
              : 'This device does not have edge-ml installed. Flash now to install the firmware. Please do not close this window, while the firmware is flashing.'}
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
              You can download and install the latest version of the edge-ml
              firmware by clicking on the update button.
            </div>
            <Button
              outline
              color="primary"
              disabled={this.state.dfuState !== 'start'}
              onClick={this.downLoadAndInstallFW}
            >
              Update firmware
            </Button>
          </div>
          <div className="panelDivider"></div>

          <div className="mt-3">
            <Progress
              color={
                this.state.dfuState === 'uploadFinished' ? 'primary' : 'success'
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
            {this.renderProgressInfo(this.state.dfuState)}
          </div>
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        <Modal
          isOpen={this.props.showDFUModal}
          className="modal-xl"
          backdrop="static"
          keyboard={false}
        >
          <ModalHeader>Update firmware</ModalHeader>
          <ModalBody>{this.renderModalBody()}</ModalBody>
          <ModalFooter>
            <Button
              outline
              color="danger"
              onClick={this.props.toggleDFUModal}
              disabled={
                this.state.dfuState === 'downloadingFW' ||
                this.state.dfuState === 'dfuInProgress'
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

export default DFUModal;
