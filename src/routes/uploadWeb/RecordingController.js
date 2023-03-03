import EventEmitter from 'events';
import Semaphore from 'semaphore-async-await';

import {
  createDataset,
  appendToDataset,
  getDatasets,
} from '../../services/ApiServices/DatasetServices';

const UDDATE_INTERVAL = 10000;

export class RecordingController extends EventEmitter {
  constructor(
    sensors,
    sampleRates,
    datasetName,
    uploadInterval = UDDATE_INTERVAL
  ) {
    super();
    this._sensors = sensors;
    this._sampleRates = sampleRates;
    this._uploadInterval = uploadInterval;
    this._datasetName = datasetName;
    this._deltaTimeseries = {}; // data is stored in a mutable way to improve perf, delta since last _upload
    this._fullTimeseries = {}; // all (at least a significant part) of uploaded data, used for graph only
    this._errors = {};

    this._isRecording = false;
    this.dataPointCtr = 0;
  }

  getTimeseries = () => this._fullTimeseries;
  getErrors = () => ({ ...this._errors });

  _upload = async (series) => {
    let data = Object.entries(series).map(([name, data]) => ({
      name,
      data,
    }));
    data = data.map((elm) => {
      return {
        _id: this.newDataset.timeSeries.find((d) => d.name === elm.name)._id,
        ...elm,
      };
    });

    await appendToDataset(this.newDataset, data);
    this._deltaTimeseries = {};
  };

  _onSensorError =
    (sensor, isWarning = false) =>
    (error) => {
      this._errors[sensor.name] = { error, isWarning };
      console.log('Sensor error!');
      this.emit('error', this);
    };
  _onSensorData =
    (sensor) =>
    (data, { timestamp }) => {
      for (const [key, val] of Object.entries(data)) {
        // init timeseries, if not done already
        this._deltaTimeseries[key] = this._deltaTimeseries[key] || [];
        this._fullTimeseries[key] = this._fullTimeseries[key] || [];
        this.dataPointCtr++;

        // create single data point
        const point = [timestamp, val];
        this._deltaTimeseries[key].push(point);
        this._fullTimeseries[key].push(point);
      }

      this.emit('received-data', this);

      if (this.dataPointCtr > this.uploadInterval) {
        this._upload(this._deltaTimeseries);
        this._deltaTimeseries = {};
        this.dataPointCtr = 0;
      }
    };

  async start() {
    if (this._isRecording) throw new Error('already recording');
    this._isRecording = true;

    const oldDatasets = (await getDatasets()).map((elm) => elm._id);
    this.newDataset = (
      await createDataset({
        name: this._datasetName,
        start: new Date().getTime() + 10000000,
        end: 0,
        timeSeries: this._sensors
          .map((sensor) =>
            sensor.components.map((component) => ({
              name: component,
              start: new Date().getTime() + 10000000,
              end: 0,
              data: [],
            }))
          )
          .flat(),
      })
    ).filter((elm) => !oldDatasets.includes(elm._id))[0];

    // reset stores
    this._deltaTimeseries = {};
    this._fullTimeseries = {};
    this._errors = {};

    for (const sensor of this._sensors) {
      sensor.removeAllListeners();

      sensor.on('warn', this._onSensorError(sensor, true));
      sensor.on('error', this._onSensorError(sensor));
      sensor.on('data', this._onSensorData(sensor));
      await sensor.listen({
        ...(sensor.properties.fixedFrequency
          ? {}
          : { frequency: this._sampleRates[sensor.name] }),
      });
    }
  }

  async _stop() {
    for (const sensor of this._sensors) {
      sensor.stop();
      sensor.removeAllListeners();
    }
  }

  async stop() {
    if (!this._isRecording) return;
    await this._stop();
    await this._upload(this._deltaTimeseries);
    this._isRecording = false;
  }

  async abort() {
    if (!this._isRecording) return;
    await this._stop();
    this._isRecording = false;
  }
}
