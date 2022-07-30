import React, { Component } from 'react';
import BleNotActivated from '../components/BLE/BleNotActivated';

class DFUPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //bleDevice,
      bleStatus: navigator.bluetooth,
      //gattService,
      //gattInternalCharacteristic,
      //gattExternalCharacteristic,
      //dfuCharacteristic,
      //arrayFW,
      //fwLen,
      bytesArray: new Uint8Array(235),
      dataLen: 232,
      iterations: 0,
      spareBytes: 0,
      updateIndex: 0,
      //var dfuTimeout;
      debug: false,
      crc8bit: 0,
      onlyCRCleft: false,
      //elem,
    };

    this.deviceName = 'NICLA';
    this.dfuService = '34c2e3b8-34aa-11eb-adc1-0242ac120002';
    this.dfuInternalCharacteristic = '34c2e3b9-34aa-11eb-adc1-0242ac120002';
    this.dfuExternalCharacteristic = '34c2e3ba-34aa-11eb-adc1-0242ac120002';
  }

  render() {
    if (!this.state.bleStatus) {
      return <BleNotActivated></BleNotActivated>;
    }
    return null;
  }
}

export default DFUPage;
