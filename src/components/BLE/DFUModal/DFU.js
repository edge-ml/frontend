const DFU_SERVICE_UUID = '34c2e3b8-34aa-11eb-adc1-0242ac120002';
const DFU_INTERNALL_CHARACTERISTIC = '34c2e3b9-34aa-11eb-adc1-0242ac120002';
const DFU_EXTERNAL_CHRARACTERISTIC = '34c2e3ba-34aa-11eb-adc1-0242ac120002';

class DFUManager {
  constructor(
    setFlashState,
    setFlashError,
    setFlashProgress,
    setConnectedDevice
  ) {
    this.setFlashState = setFlashState;
    this.setFlashError = setFlashError;
    this.setFlashProgress = setFlashProgress;
    this.setConnectedDevice = setConnectedDevice;

    this.arrayFW = null;
    this.fwLen = null;
    this.bytesArray = new Uint8Array(235);
    this.dataLen = 232;
    this.iterations = 0;
    this.spareBytes = 0;
    this.updateIndex = 0;
    this.crc8bit = 0;
    this.onlyCRCleft = false;
    this.dfuCharacteristic = undefined;
    this.debug = true;

    this.crc8 = this.crc8.bind(this);
    this.connectDevice = this.connectDevice.bind(this);
    this.disconnectDevice = this.disconnectDevice.bind(this);
    this.increaseIndex = this.increaseIndex.bind(this);
    this.flashFirmware = this.flashFirmware.bind(this);
    this.init = this.init.bind(this);
    this.resetState = this.resetState.bind(this);
    this.update = this.update.bind(this);
  }

  async disconnectDevice(connectedDevice) {
    if (connectedDevice.gatt && connectedDevice.gatt.disconnect) {
      try {
        await connectedDevice.gatt.disconnect();
        console.log('Disconnected from the device');
      } catch (error) {
        console.error('Error occurred during disconnection:', error);
      }
    }
    this.resetState(false);
  }

  async connectDevice() {
    const options = {
      acceptAllDevices: true,
      optionalServices: [DFU_SERVICE_UUID],
    };
    const device = await navigator.bluetooth.requestDevice(options);
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(DFU_SERVICE_UUID);
    this.dfuCharacteristic = await service.getCharacteristic(
      DFU_INTERNALL_CHARACTERISTIC
    );
    console.log('Device connected');
    this.setFlashState('connected');
    this.setConnectedDevice(device);
  }

  init(firmware) {
    this.arrayFW = new Uint8Array(firmware);
    this.fwLen = this.arrayFW.length;

    console.log('Binary file length: ', this.fwLen);
    if (this.debug === true) {
      console.log(this.arrayFW);
    }
    this.crc8();
    console.log('Computed 8-bit CRC: ', this.crc8bit);

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
  }

  crc8() {
    var i;
    this.crc8bit = this.arrayFW[0];
    for (i = 1; i < this.fwLen; i++) {
      this.crc8bit = this.crc8bit ^ this.arrayFW[i];
    }
  }

  flashFirmware = (firmware) => {
    this.setFlashState('uploading');
    this.init(firmware);
    this.update(this.updateIndex);
    this.setFlashState('finished');
  };

  update = (index) => {
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
        this.setFlashProgress((index / (this.iterations - 1)) * 100);

        this.increaseIndex();
        if (this.debug === true) {
          console.log('Written');
        }
      })
      .catch((e) => {
        console.log(e);
        this.resetState(
          true,
          'An error occured while sending package to BLE device'
        );
      });
  };

  increaseIndex() {
    if (this.updateIndex < this.iterations - 1) {
      this.updateIndex++;
      this.update(this.updateIndex);
    } else {
      console.log('firmware sent');
      this.setFlashState('finished');
      return;
    }
  }

  resetState(hasError, msg = '') {
    if (hasError) {
      this.setFlashError(msg);
    }
    this.setConnectedDevice(undefined);
    this.setFlashState('start');
  }
}

export default DFUManager;
