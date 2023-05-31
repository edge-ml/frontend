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
import {
  ga_uploadataset_len,
  ga_uploadDataset,
} from '../../services/AnalyticsService';

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
        const now = Date.now();
        this.uploadCache(this.recordedData, now);
        this.recordedData = [];
        this.uploadBLE.labelingData.current = this.uploadBLE.labelingData.current
                                                .filter(l => l.end > now || l.end === undefined)
                                                .map(l => l.start > now ? l : { ...l, start: now }); 
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

  async uploadCache(recordedData, timestamp) {
    recordedData = parseTimeSeriesData(
      this.newDataset,
      this.recordedData,
      this.recordingSensors,
      this.sensors
    );
    this.addToUploadCounter(recordedData);
    const labelingData = this.uploadBLE.labelingData.current.map(l => l.end === undefined ? {...l, end: timestamp} : l);
    await appendToDataset(this.newDataset, { timeSeries: recordedData, labels: labelingData });
  }

  addToUploadCounter(recordedData) {
    console.log('before', this.uploadCounter)
    recordedData.forEach((elm) => {
      if (this.uploadCounter.has(elm.name)) {
        var old_ctr = this.uploadCounter.get(elm.name);
        this.uploadCounter.set(elm.name, old_ctr + elm.data.length);
      } else {
        this.uploadCounter.set(elm.name, elm.data.length);
      }
    });
    console.log('after', this.uploadCounter)
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
    const labelingData = this.uploadBLE.labelingData.current;
    const jsonBody = { timeSeries: recordedData, labels: labelingData ? labelingData : [] };
    this.addToUploadCounter(recordedData);
    ga_uploadataset_len(
      Array.from(this.uploadCounter.values()),
      'bluetooth',
      this.deviceInfo
    );
    await appendToDataset(this.newDataset, jsonBody);
    this.recordingSensors = [];
    this.recordedData = [];
    this.uploadCounter = new Map();
  }
}

export default BleDeviceProcessor;
