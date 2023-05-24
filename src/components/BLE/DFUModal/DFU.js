const DFU_SERVICE_UUID = '34c2e3b8-34aa-11eb-adc1-0242ac120002';
const DFU_INTERNALL_CHARACTERISTIC = '34c2e3b9-34aa-11eb-adc1-0242ac120002';
const DFU_EXTERNAL_CHRARACTERISTIC = '34c2e3ba-34aa-11eb-adc1-0242ac120002';

class DFUManager {
  constructor(arrayFW) {
    this.arrayFW = this.generateRandomArrayBuffer(1024 * 100);
    this.fwLen = this.arrayFW.length;
    this.dfuCharacteristic = undefined;
    this.crc8(arrayFW);
    this.bytesArray = new Uint8Array(235);
  }

  async connectDevice() {
    const options = { acceptAllDevices: true };
    const device = await navigator.bluetooth.requestDevice(options);
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(DFU_SERVICE_UUID);
    this.dfuCharacteristic = await service.getCharacteristic(
      DFU_INTERNALL_CHARACTERISTIC
    );
    console.log('Device connected');
  }

  flashFirmware() {
    // this.dfuCharacteristic.writeValue(this.fw_array).then(data => console.log(data))
    this.iterations = Math.floor(this.fwLen / this.dataLen);
    this.spareBytes = this.fwLen % this.dataLen;
    this.iterations++;
    if (this.spareBytes === 0) {
      this.onlyCRCleft = true;
    }
    this.updateIndex = 0;

    this.update(this.updateIndex);
  }

  crc8() {
    var i;
    this.crc8bit = this.arrayFW[0];
    for (i = 1; i < this.fwLen; i++) {
      this.crc8bit = this.crc8bit ^ this.arrayFW[i];
    }
  }

  generateRandomArrayBuffer(length) {
    const arrayBuffer = new ArrayBuffer(length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < length; i++) {
      uint8Array[i] = Math.floor(Math.random() * 256);
    }

    return arrayBuffer;
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
        console.log((index / this.iterations - 1) * 100);

        this.increaseIndex();
        if (this.debug === true) {
          console.log('Written');
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }
}

export default DFUManager;
