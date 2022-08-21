import React, { Component } from 'react';
import {
  ModalHeader,
  Container,
  Row,
  Col,
  Button,
  Progress,
  Spinner,
} from 'reactstrap';
import BleNotActivated from '../components/BLE/BleNotActivated';

class DFUPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isConnected: false,
      bleDevice: undefined,
      bleStatus: navigator.bluetooth,
      gattService: undefined,
      gattInternalCharacteristic: undefined,
      gattExternalCharacteristic: undefined,
      progress: 0,
      uploadFinished: false,
      isFetchingFW: true,
    };

    this.niclaSenseMEFirmwareLink =
      'https://nightly.link/edge-ml/EdgeML-Arduino/workflows/build/main/nicla.bin.zip';
    this.deviceName = 'NICLA';
    this.dfuService = '34c2e3b8-34aa-11eb-adc1-0242ac120002';
    this.dfuInternalCharacteristic = '34c2e3b9-34aa-11eb-adc1-0242ac120002';
    this.dfuExternalCharacteristic = '34c2e3ba-34aa-11eb-adc1-0242ac120002';

    this.dfuCharacteristic;
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

    this.getDeviceInfo = this.getDeviceInfo.bind(this);
    this.crc8 = this.crc8.bind(this);
    this.connect = this.connect.bind(this);
    this.connectGATTdfu = this.connectGATTdfu.bind(this);
    this.onConnection = this.onConnection.bind(this);
    this.onDisconnection = this.onDisconnection.bind(this);
    this.update = this.update.bind(this);
    this.increaseIndex = this.increaseIndex.bind(this);
    this.updateFW = this.updateFW.bind(this);
    this.fetchFirmware = this.fetchFirmware.bind(this);
  }

  componentDidMount() {
    this.fetchFirmware();
  }

  async fetchFirmware() {
    const response = await fetch(this.niclaSenseMEFirmwareLink);
    if (!response.ok) {
      throw new Error('HTTP error ' + response.status);
    }
    console.log(response.type);
    this.arrayFW = new Uint8Array(await response.arrayBuffer());
    this.fwLen = this.arrayFW.length;
    console.log('Binary file length: ', this.fwLen);
    if (this.debug == true) {
      console.log(this.arrayFW);
    }
    this.crc8();
    console.log('Computed 8-bit CRC: ', this.crc8bit);
    console.log('Press "Update" button to start the fw update');
    this.setState({ isFetchingFW: false });
  }

  /** -
  loadFile() {
    var reader = new FileReader();
    reader.addEventListener('load', () => {
      var arrayBuffer = this.result;
      this.arrayFW = new Uint8Array(arrayBuffer);
      this.fwLen = this.arrayFW.length;

      console.log('Binary file length: ', this.fwLen);
      if (this.debug == true) {
        console.log(this.arrayFW);
      }
      this.crc8();
      console.log('Computed 8-bit CRC: ', this.crc8bit);
      console.log('Press "Update" button to start the fw update');

      //document.querySelector('#update').disabled = false;
    });

    reader.readAsArrayBuffer(new File([''], 'filepath'));
    // Update label file name
    //var fileName = $(this).val().replace('C:\\fakepath\\', " ");
    //$(this).next('.custom-file-label').html(fileName);
  }
  */

  getDeviceInfo() {
    let options = {
      filters: [{ name: this.deviceName }],
      optionalServices: [this.dfuService],
    };
    if (this.debug == true) {
      console.log('Requesting BLE device info...');
    }
    return navigator.bluetooth
      .requestDevice(options)
      .then((device) => {
        this.setState({ bleDevice: device });
      })
      .catch((error) => {
        console.log('Request device error: ' + error);
      });
  }

  crc8() {
    var i;
    this.crc8bit = this.arrayFW[0];
    for (i = 1; i < this.fwLen; i++) {
      this.crc8bit = this.crc8bit ^ this.arrayFW[i];
    }
  }

  connect() {
    return this.getDeviceInfo()
      .then(this.connectGATTdfu)
      .then((_) => {
        //console.log('Select the binary file that you want to send to Nicla');
        this.onConnection();
      })
      .catch((error) => {
        console.log('ERROR: ' + error);
      });
  }

  disconnect() {
    return null;
  }

  connectGATTdfu() {
    this.state.bleDevice.addEventListener(
      'gattserverdisconnected',
      this.onDisconnection
    );
    return this.state.bleDevice.gatt
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

  onDisconnection(event) {
    this.setState({ isConnected: false });
  }

  onConnection() {
    this.setState({ isConnected: true });
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
    //console.log(bytesArray);
    //console.log('Writing 67 bytes array...');
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
      this.setState({ uploadFinished: true });
      return;
    }
  }

  updateFW() {
    if (this.state.isConnected) {
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
      this.dfuCharacteristic = this.state.gattInternalCharacteristic;
      this.update(this.updateIndex);
    }
  }

  render() {
    if (!this.state.bleStatus) {
      return <BleNotActivated></BleNotActivated>;
    }
    if (this.state.isFetchingFW) {
      return (
        <div>
          <Spinner color="primary" />
        </div>
      );
    }
    return (
      <div className="text-center">
        <ModalHeader>DFU Page</ModalHeader>
        <Container>
          <Row className="mt-2">
            <Col>Connect to the Nicla Sense ME</Col>
          </Row>
          <Row className="mt-2">
            <Col>
              <Button
                color={this.state.isConnected ? 'danger' : 'primary'}
                onClick={() => {
                  if (this.state.isConnected) {
                    this.disconnect();
                  } else {
                    this.connect();
                  }
                }}
              >
                {this.state.isConnected ? 'Disconnect' : 'Connect'}
              </Button>
            </Col>
          </Row>
          <Row className="mt-2">
            <Col>Press Upload to flash the edge-ml firmware.</Col>
          </Row>
          <Row className="mt-2">
            <Col>
              <Button
                color="primary"
                onClick={() => {}}
                disabled={!this.state.isConnected}
              >
                Upload
              </Button>
            </Col>
          </Row>
          <Row className="mt-2">
            <Col>
              <Progress color="success" value={this.state.progress} />
              <div>
                {this.state.uploadFinished ? 'Fw update completed!' : ''}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default DFUPage;
