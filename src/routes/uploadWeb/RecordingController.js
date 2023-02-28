import EventEmitter from 'events';
import { throttle } from '../../services/helpers';
import Semaphore from 'semaphore-async-await';

import {
  createDataset,
  appendToDataset,
  getDatasets,
} from '../../services/ApiServices/DatasetServices';

const DEFAULT_DELTA_UPLOAD_INTERVAL = 500;

export class RecordingController extends EventEmitter {
  constructor(
    sensors,
    sampleRates,
    datasetName,
    uploadInterval = DEFAULT_DELTA_UPLOAD_INTERVAL
  ) {
    super();
    this._sensors = sensors;
    this._sampleRates = sampleRates;
    this._uploadInterval = uploadInterval;
    this._datasetName = datasetName;

    this._uploadLock = new Semaphore(1);
    this._deltaTimeseries = {}; // data is stored in a mutable way to improve perf, delta since last _upload
    this._fullTimeseries = {}; // all (at least a significant part) of uploaded data, used for graph only
    this._errors = {};

    this._isRecording = false;

    this._uploadThrottled = throttle(this._upload, this._uploadInterval);
  }

  getTimeseries = () => this._fullTimeseries;
  getErrors = () => ({ ...this._errors });

  _upload = async () => {
    // lock to ensure no datapoint goes missing (new datapoint could come while uploading, which is done out of the event loop)
    // more info on why this is needed: https://github.com/jsoendermann/semaphore-async-await#but-javascript-is-single-threaded-and-doesnt-need-semaphores
    // we are uploading deltas, so we can miss stuff
    await this._uploadLock.acquire();

    try {
      if (Object.values(this._deltaTimeseries).flat().length === 0) return; // nothing to _upload

      const data = Object.entries(this._deltaTimeseries).map(
        ([name, data]) => ({ name, data })
      );
      const ts = this.newDataset.timeSeries.map((elm) => {
        return { id: elm['_id'], data: data };
      });
      await appendToDataset(this.newDataset, ts);
      this._deltaTimeseries = {};
    } finally {
      this._uploadLock.release();
    }
  };

  _onSensorError =
    (sensor, isWarning = false) =>
    (error) => {
      this._errors[sensor.name] = { error, isWarning };
      this.emit('error', this);
    };
  _onSensorData =
    (sensor) =>
    (data, { timestamp }) => {
      for (const [key, val] of Object.entries(data)) {
        // init timeseries, if not done already
        this._deltaTimeseries[key] = this._deltaTimeseries[key] || [];
        this._fullTimeseries[key] = this._fullTimeseries[key] || [];

        // create single data point
        const point = [timestamp, val]; // this 'datapoint' naming here is bad, but it's how it's done in the server, so it's kept for simplicity
        this._deltaTimeseries[key].push(point);
        this._fullTimeseries[key].push(point);
      }

      this.emit('received-data', this);
      // does NOT _upload with every datapoint, it's throttled
      this._uploadThrottled();
    };

  async start() {
    if (this._isRecording) throw new Error('already recording');
    this._isRecording = true;

    const oldDatasets = (await getDatasets()).map((elm) => elm._id);
    this.newDataset = (
      await createDataset({
        name: this._datasetName,
        start: new Date().getTime() + 10000000,
        end: new Date().getTime(),
        timeSeries: this._sensors
          .map((sensor) =>
            sensor.components.map((component) => ({
              name: component,
              start: new Date().getTime() + 10000000,
              end: new Date().getTime(),
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
    await this._upload();
    this._isRecording = false;
  }

  async abort() {
    if (!this._isRecording) return;
    await this._stop();
    this._isRecording = false;
  }
}
