import EventEmitter from 'events';

/**
 * Battery Status API based battery sensor, conforms to Sensor api above
 */
export class BatterySensor extends EventEmitter {
  constructor() {
    super();
    this._battery = null;

    this.name = 'Battery';
    this.shortComponents = [
      'Charging',
      'ChargingTime',
      'DischargingTime',
      'Level',
    ];
    this.components = this.shortComponents.map((x) => this.name + x);

    this.properties = {
      fixedFrequency: true,
    };
  }

  _handler = (event) => {
    this.emit(
      'data',
      {
        [this.name + 'Charging']: this._battery.charging ? 1 : 0,
        [this.name + 'ChargingTime']: this._battery.chargingTime,
        [this.name + 'DischargingTime']: this._battery.dischargingTime,
        [this.name + 'Level']: this._battery.level,
      },
      {
        timestamp: Date.now(),
      }
    );
  };

  listen = async (opts = {}) => {
    this.stop();

    try {
      this._battery = await navigator.getBattery();
      this._battery.addEventListener('chargingchange', this._handler);
      this._battery.addEventListener('levelchange', this._handler);
      this._battery.addEventListener('chargingtimechange', this._handler);
      this._battery.addEventListener('dischargingtimechange', this._handler);
      this._handler();
    } catch (error) {
      this.stop();
      this.emit('error', error.message);
    }
  };

  stop = () => {
    if (this._battery) {
      this._battery.removeEventListener('chargingchange', this._handler);
      this._battery.removeEventListener('levelchange', this._handler);
      this._battery.removeEventListener('chargingtimechange', this._handler);
      this._battery.removeEventListener('dischargingtimechange', this._handler);
    }
  };

  detection = () => navigator.getBattery;
}
