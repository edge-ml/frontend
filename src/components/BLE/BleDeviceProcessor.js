import {
  floatToBytes,
  intToBytes,
  parseData,
  getBaseDataset,
  parseTimeSeriesData,
} from '../../services/bleService';

import {
  createDataset,
  appendToDataset,
  getDatasets,
} from '../../services/ApiServices/DatasetServices';

class BleDeviceProcessor {
  constructor(
    device,
    deviceInfo,
    sensors,
    sensorConfigCharacteristic,
    sensorDataCharacteristic,
    uploadBLE
  ) {
    this.device = device;
    this.deviceInfo = deviceInfo;
    this.sensors = sensors;
    this.sensorConfigCharacteristic = sensorConfigCharacteristic;
    this.sensorDataCharacteristic = sensorDataCharacteristic;
    this.sensorData = new Map();
    this.recordInterval = undefined;
    this.recordedData = [];
    this.newDataset = undefined;
    this.recordingSensors = [];
    this.uploadBLE = uploadBLE;
    this.uploadCounter = new Map();
  }

  async configureSingleSensor(sensorId, sampleRate, latency) {
    if (!this.device.gatt.connected) {
      return;
    }
    var configPacket = new Uint8Array(9);
    configPacket[0] = sensorId;
    configPacket.set(floatToBytes(sampleRate), 1);
    configPacket.set(intToBytes(latency), 5);
    await this.sensorConfigCharacteristic.writeValue(configPacket);
  }

  async unSubscribeAllSensors() {
    for (const bleKey of Object.keys(this.sensors)) {
      await this.configureSingleSensor(bleKey, 0, 0);
    }
  }

  async prepareRecording(sensorsToRecord, latency) {
    for (const bleKey of Object.keys(this.sensors)) {
      if (sensorsToRecord.has(bleKey)) {
        await this.configureSingleSensor(
          bleKey,
          this.sensors[bleKey].sampleRate,
          latency
        );
        this.recordedData = [];
        this.recordingSensors = sensorsToRecord;
      } else {
        await this.configureSingleSensor(bleKey, 0, 0);
      }
    }
  }

  async startRecording(selectedSensors, latency, datasetName) {
    var oldDatasets = (await getDatasets()).map((elm) => elm._id);
    this.newDataset = (
      await createDataset(
        getBaseDataset(
          [...selectedSensors].map((elm) => this.sensors[elm]),
          datasetName
        )
      )
    ).filter((elm) => !oldDatasets.includes(elm._id))[0];
    await this.prepareRecording(selectedSensors, latency);
    var recordingStart = new Date().getTime();
    var adjustedTime = false;
    const recordData = (value) => {
      var sensor = value.getUint8(0);
      var timestamp = value.getUint32(2, true);
      if (!adjustedTime) {
        adjustedTime = true;
        recordingStart -= timestamp;
      }
      var parsedData = parseData(this.sensors[sensor], value);
      this.recordedData.push({
        sensor: sensor,
        time: timestamp + recordingStart,
        data: parsedData,
      });
      if (
        this.recordedData.length > 1000 ||
        timestamp - recordingStart > 300000
      ) {
        this.uploadCache(this.recordedData);
        this.recordedData = [];
      }
      return {
        sensor: sensor,
        time: timestamp + recordingStart,
        data: parsedData,
      };
    };
    this.sensorDataCharacteristic.startNotifications();
    this.sensorDataCharacteristic.addEventListener(
      'characteristicvaluechanged',
      (event) => {
        let currentValue = recordData(event.target.value);
        this.uploadBLE.setCurrentData(currentValue);
      }
    );
  }

  async uploadCache(recordedData) {
    recordedData = parseTimeSeriesData(
      this.newDataset,
      this.recordedData,
      this.recordingSensors,
      this.sensors
    );
    this.addToUploadCounter(recordedData);
    await appendToDataset(this.newDataset, recordedData);
  }

  addToUploadCounter(recordedData) {
    recordedData.forEach((elm) => {
      if (this.uploadCounter.has(elm.name)) {
        var old_ctr = this.uploadCounter.get(elm.name);
        this.uploadCounter.set(elm.name, old_ctr + elm.data.length);
      } else {
        this.uploadCounter.set(elm.name, elm.data.length);
      }
    });
  }

  async stopRecording() {
    clearInterval(this.recordInterval);
    this.unSubscribeAllSensors();
    const recordedData = parseTimeSeriesData(
      this.newDataset,
      this.recordedData,
      this.recordingSensors,
      this.sensors
    );
    this.addToUploadCounter(recordedData);
    await appendToDataset(this.newDataset, recordedData);
    this.recordingSensors = [];
    this.recordedData = [];
    this.uploadCounter = new Map();
  }
}

export default BleDeviceProcessor;
