import React, { Component } from 'react';
import {
  ModalHeader,
  Container,
  Row,
  Col,
  Button,
  Progress,
  Spinner,
  Label,
  Input,
  InputGroup,
  Modal,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import JSZip from 'jszip';

class DFUModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gattService: undefined,
      gattInternalCharacteristic: undefined,
      gattExternalCharacteristic: undefined,
      dfuCharacteristic: undefined,
      progress: 0,
      uploadFinished: false,
      fileLoaded: false,
      isConnectingGATTDFU: false,
      //fwUpdateInProgress: false,
      //fwDownloading: false,
    };

    this.niclaSenseMEFirmwareLink =
      'https://nightly.link/edge-ml/EdgeML-Arduino/workflows/build/main/nicla.bin.zip';
    this.nano33FirmwareLink =
      'https://nightly.link/edge-ml/EdgeML-Arduino/workflows/build/main/nano.bin.zip';
    this.seeedXiaonRF52840SenseFirmwareLink =
      'https://nightly.link/edge-ml/EdgeML-Arduino/workflows/build/main/xiao.bin.zip';
    this.dfuService = '34c2e3b8-34aa-11eb-adc1-0242ac120002';
    this.dfuInternalCharacteristic = '34c2e3b9-34aa-11eb-adc1-0242ac120002';
    this.dfuExternalCharacteristic = '34c2e3ba-34aa-11eb-adc1-0242ac120002';

    this.arrayFW;
    this.fwLen;
    this.bytesArray = new Uint8Array(235);
    this.dataLen = 232;
    this.iterations = 0;
    this.spareBytes = 0;
    this.updateIndex = 0;
    //var dfuTimeout;
    this.debug = true;
    this.crc8bit = 0;
    this.onlyCRCleft = false;

    this.crc8 = this.crc8.bind(this);
    this.connectGATTdfu = this.connectGATTdfu.bind(this);
    this.update = this.update.bind(this);
    this.increaseIndex = this.increaseIndex.bind(this);
    this.updateFW = this.updateFW.bind(this);
    //this.downloadSelectedFirmware = this.downloadSelectedFirmware.bind(this);
    this.loadFile = this.loadFile.bind(this);
    this.readerCallback = this.readerCallback.bind(this);
    this.downloadFirmware = this.downloadFirmware.bind(this);
  }

  async componentDidMount() {
    this.setState({ isConnectingGATTDFU: true });
    await this.connectGATTdfu();
    this.setState({ isConnectingGATTDFU: false });
  }

  readerCallback(result) {
    {
      var arrayBuffer = result;
      this.arrayFW = new Uint8Array(arrayBuffer);
      this.fwLen = this.arrayFW.length;

      console.log('Binary file length: ', this.fwLen);
      if (this.debug == true) {
        console.log(this.arrayFW);
      }
      this.crc8();
      console.log('Computed 8-bit CRC: ', this.crc8bit);
      console.log('Press "Update" button to start the fw update');
      this.setState({ fileLoaded: true });
    }
  }

  loadFile(files) {
    var reader = new FileReader();
    reader.addEventListener('load', (event) =>
      this.readerCallback(event.target.result)
    );

    reader.readAsArrayBuffer(files[0]);
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
        this.setState({ gattService: service });
        if (this.debug == true) {
          console.log('Getting service:', service);
        }
        return service.getCharacteristic(this.dfuInternalCharacteristic);
      })
      .then((characteristic) => {
        this.setState({ gattInternalCharacteristic: characteristic });
        if (this.debug == true) {
          console.log('Looking for characteristic...');
          console.log(
            'dfu internal characteristic:',
            this.state.gattInternalCharacteristic
          );
        }
      })
      .then((_) => {
        return this.state.gattService.getCharacteristic(
          this.dfuExternalCharacteristic
        );
      })
      .then((characteristic) => {
        this.setState({ gattExternalCharacteristic: characteristic });
        if (this.debug == true) {
          console.log('Looking for characteristic...');
          console.log(
            'dfu external characteristic:',
            this.state.gattExternalCharacteristic
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
    this.state.dfuCharacteristic.writeValue(this.bytesArray).then((_) => {
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
      this.setState({ uploadFinished: true, fwUpdateInProgress: false });
      return;
    }
  }

  promisedSetState = (newState) =>
    new Promise((resolve) => this.setState(newState, resolve));

  async updateFW() {
    this.setState({ fwUpdateInProgress: true });
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
    await this.promisedSetState({
      dfuCharacteristic: this.state.gattInternalCharacteristic,
    });
    /**if (this.state.selectedDevice == '1') {
      this.setState({
        dfuCharacteristic: this.state.gattInternalCharacteristic,
      });
    } else {
      this.setState({
        dfuCharacteristic: this.state.gattExternalCharacteristic,
      });
    }*/
    this.update(this.updateIndex);
  }

  downloadFirmware() {
    window.location.href = this.niclaSenseMEFirmwareLink;
  }

  render() {
    return (
      <div>
        <Modal
          isOpen={this.props.showDFUModal}
          className="modal-xl"
          backdrop="static"
          keyboard="false"
        >
          <ModalHeader>Update firmware</ModalHeader>
          <ModalBody>
            {this.state.isConnectingGATTDFU ? (
              <div>
                <Spinner color="primary" />
              </div>
            ) : (
              <div className="align-items-center">
                <div>
                  Connected BLE device:{' '}
                  <strong>{this.props.connectedBLEDevice.name}</strong>
                </div>
                <div>
                  {this.props.hasEdgeMLInstalled
                    ? "This device already has edge-ml installed, but an update is possible. Please don't close this window, while the firmware is flashing."
                    : "This device does not have edge-ml installed. Flash now to install the firmware. Please don't close this window, while the firmware is flashing."}
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
                    You can download the newest edge-ml firmware by clicking on
                    the download firmware button
                  </div>
                  <Button color="primary" onClick={this.downloadFirmware}>
                    Download firmware
                  </Button>
                </div>
                <div className="panelDivider"></div>
                <div
                  style={{
                    display: 'column',
                    alignItems: 'space-between',
                    justifyContent: 'space-evenly',
                  }}
                >
                  <div>
                    Select binary firmware file for the flashing process.
                  </div>
                  <Input
                    type="file"
                    onChange={(e) => this.loadFile(e.target.files)}
                  />
                </div>
                <div className="panelDivider"></div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Button
                    color="primary"
                    disabled={!this.state.fileLoaded}
                    onClick={this.updateFW}
                  >
                    Update firmware
                  </Button>
                </div>
                <div className="mt-3">
                  <Progress
                    color={
                      this.state.fwUpdateInProgress ? 'primary' : 'success'
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
                  {this.state.uploadFinished
                    ? 'The firmware update is completed'
                    : ''}
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              onClick={this.props.toggleDFUModal}
              disabled={this.state.fwUpdateInProgress}
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
