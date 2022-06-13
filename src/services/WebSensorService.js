import {
  Accelerometer,
  LinearAccelerationSensor,
  GravitySensor,
  Gyroscope,
  RelativeOrientationSensor,
  AbsoluteOrientationSensor,
} from 'motion-sensors-polyfill';

import EventEmitter from 'events';

/**
 * Web sensor conforming to the following generic interface:
 * interface:
 *  - name: string
 *  - shortComponents: string[]
 *  - components: string[]
 *  - listen: (opts: SensorOptions) => void
 *  - stop: () => void
 * events/payloads:
 *  - error: any
 *  - data: Record<keyof typeof this.components, number>, { timestamp: number }
 */
class Sensor extends EventEmitter {
  constructor(sensorName, Sensor, shortComponents, mapComponents) {
    super();
    this._sensorName = sensorName;
    this.name = sensorName;
    this._Sensor = Sensor;
    this.shortComponents = shortComponents;
    this.components = shortComponents.map((x) => sensorName + x);
    this._mapComponents = mapComponents;

    this._sensor = null;
  }

  listen = (opts = {}) => {
    this.stop();

    // const clVal = setInterval(() => {
    //     this.emit('data', XYZMAP(this, {x: Math.random() * 100, y: Math.random() * 100, z: Math.random() * 100}), {
    //         timestamp: Date.now()
    //     })
    // }, 1000 / opts.frequency)

    // this._sensor = { stop: () => clearInterval(clVal) }

    // return;
    try {
      this._sensor = new this._Sensor({ ...opts });
      this._sensor.onerror = (event) => {
        // Handle runtime errors.
        this.stop();
        if (event.error.name === 'NotAllowedError') {
          this.emit('error', 'Permission to access sensor was denied.');
        } else if (event.error.name === 'NotReadableError') {
          this.emit('error', 'Cannot connect to the sensor.');
        }
      };
      this._sensor.onreading = (e) => {
        this.emit('data', this._mapComponents(this, this._sensor, e), {
          timestamp: Date.now(),
        });
      };
      this._sensor.start();
    } catch (error) {
      // Handle construction errors.
      this.stop();
      if (error.name === 'SecurityError') {
        this.emit(
          'error',
          'Sensor construction was blocked by the Permissions Policy.'
        );
      } else if (error.name === 'ReferenceError') {
        this.emit('error', 'Sensor is not supported by the User Agent.');
      } else {
        throw error;
      }
    }
  };

  stop = () => {
    if (this._sensor) {
      this._sensor.stop();
      this._sensor = null;
    }
  };
}

const XYZMAP = ({ name }, { x, y, z }) => ({
  [name + 'X']: x,
  [name + 'Y']: y,
  [name + 'Z']: z,
});

const QUATMAP = ({ name }, { quaternion: [c1, c2, c3, c4] }) => ({
  [name + '1']: c1,
  [name + '2']: c2,
  [name + '3']: c3,
  [name + '4']: c4,
});

export const SENSORS = [
  new Sensor('Accelerometer', Accelerometer, ['X', 'Y', 'Z'], XYZMAP),
  new Sensor(
    'LinearAccelerationSensor',
    LinearAccelerationSensor,
    ['X', 'Y', 'Z'],
    XYZMAP
  ),
  new Sensor('GravitySensor', GravitySensor, ['X', 'Y', 'Z'], XYZMAP),
  new Sensor('Gyroscope', Gyroscope, ['X', 'Y', 'Z'], XYZMAP),
  new Sensor(
    'RelativeOrientationSensor',
    RelativeOrientationSensor,
    ['1', '2', '3', '4'],
    QUATMAP
  ),
  new Sensor(
    'AbsoluteOrientationSensor',
    AbsoluteOrientationSensor,
    ['1', '2', '3', '4'],
    QUATMAP
  ),
  new Sensor(
    'AmbientLightSensor',
    window.AmbientLightSensor,
    ['Illuminance'],
    ({ name }, { illuminance }) => ({
      [name + 'Illuminance']: illuminance,
    })
  ),
  new Sensor('Magnetometer', window.Magnetometer, ['X', 'Y', 'Z'], XYZMAP),
].filter((x) => x);

const preliminaryDetection = ({ name: sensor }) => sensor in window;

export const SUPPORTED_SENSORS = SENSORS.filter(preliminaryDetection);
