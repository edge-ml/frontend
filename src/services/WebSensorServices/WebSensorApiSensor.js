import EventEmitter from 'events';

/**
 * Web Sensor API based Sensors
 */
export class WebSensorApiSensor extends EventEmitter {
  constructor(
    sensorName,
    Sensor,
    shortComponents,
    mapComponents,
    askPermission
  ) {
    super();
    this._sensorName = sensorName;
    this.name = sensorName;
    this.ssssSensor = Sensor;
    this.shortComponents = shortComponents;
    this.components = shortComponents.map((x) => sensorName + x);
    this._mapComponents = mapComponents;
    this._askPermission = askPermission;

    this._sensor = null;

    this.properties = {
      fixedFrequency: false,
    };
  }

  listen = async (opts = {}) => {
    this.stop();

    const clVal = setInterval(() => {
      this.emit(
        'data',
        this._mapComponents(this, {
          x: Math.random() * 100,
          y: Math.random() * 100,
          z: Math.random() * 100,
        }),
        {
          timestamp: Date.now(),
        }
      );
    }, 1000 / opts.frequency);

    this._sensor = { stop: () => clearInterval(clVal) };

    return;
    try {
      await this._askPermission();
      this._sensor = new this.ssssSensor({ ...opts });
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
    if (this._sensor && this._sensor.stop) {
      this._sensor.stop();
      this._sensor = null;
    }
  };

  detection = () => this.name in window;
}
