import {
  floatToBytes,
  intToBytes,
  parseData,
  getBaseDataset,
  parseTimeSeriesData
} from '../../services/bleService';

import {
  createDataset,
  appendToDataset,
  getDatasets
} from '../../services/ApiServices/DatasetServices';

class BleDeviceProcessor {
  constructor(
    device,
    sensors,
    sensorConfigCharacteristic,
    sensorDataCharacteristic
  ) {
    this.device = device;
    this.sensors = sensors;
    this.sensorConfigCharacteristic = sensorConfigCharacteristic;
    this.sensorDataCharacteristic = sensorDataCharacteristic;
    this.sensorData = new Map();
    this.recordInterval = undefined;
    this.recordedData = [];
    this.newDataset = undefined;
    this.recordingSensors = [];
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

  async prepareRecording(sensorsToRecord, sampleRate, latency) {
    for (const bleKey of Object.keys(this.sensors)) {
      if (sensorsToRecord.has(bleKey)) {
        await this.configureSingleSensor(bleKey, sampleRate, latency);
        //this.recordedData[bleKey] = [];
        this.recordedData = [];
        this.recordingSensors = sensorsToRecord;
      } else {
        await this.configureSingleSensor(bleKey, 0, 0);
      }
    }
  }

  startCollectcollectSensorData() {
    const cacheData = value => {
      var sensor = value.getUint8(0);
      var parsedData = parseData(this.sensors[sensor], value);
      this.sensorData.set(sensor, parsedData);
    };
    this.sensorDataCharacteristic.startNotifications();
    this.sensorDataCharacteristic.addEventListener(
      'characteristicvaluechanged',
      event => cacheData(event.target.value)
    );
  }

  async startRecording(selectedSensors, sampleRate, latency, datasetName) {
    var oldDatasets = (await getDatasets()).map(elm => elm._id);
    this.newDataset = (
      await createDataset(
        getBaseDataset(
          [...selectedSensors].map(elm => this.sensors[elm]),
          datasetName
        )
      )
    ).filter(elm => !oldDatasets.includes(elm._id))[0];
    await this.prepareRecording(selectedSensors, sampleRate, latency);
    this.startCollectcollectSensorData();
    var recordingStart = new Date().getTime();
    const dataRecorder = () => {
      const time = new Date().getTime();
      for (const [sensor, sensorData] of this.sensorData.entries()) {
        this.recordedData.push({
          sensor: sensor,
          time: time,
          data: sensorData
        });
      }
      if (this.recordedData.length > 2000 || time - recordingStart > 300000) {
        this.uploadCache(this.recordedData);
        this.recordedData = [];
        recordingStart = new Date().getTime();
      }
    };
    dataRecorder();
    this.recordInterval = setInterval(
      dataRecorder,
      Math.floor(1000 / sampleRate)
    );
  }

  async uploadCache(recordedData) {
    recordedData = parseTimeSeriesData(
      this.recordedData,
      this.recordingSensors,
      this.sensors
    );
    await appendToDataset(this.newDataset, recordedData);
  }

  async stopRecording() {
    clearInterval(this.recordInterval);
    this.unSubscribeAllSensors();
    const recordedData = parseTimeSeriesData(
      this.recordedData,
      this.recordingSensors,
      this.sensors
    );
    await appendToDataset(this.newDataset, recordedData);
    this.recordingSensors = [];
    this.recordedData = [];
  }
}

export default BleDeviceProcessor;
