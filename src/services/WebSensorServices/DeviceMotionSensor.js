import EventEmitter from 'events';

const DELTA_FACTOR = 60;
const INITIAL_DELTA = 25;
const calcDelay = (delta) => DELTA_FACTOR * (delta + INITIAL_DELTA / 2); // add INITIAL_DELTA / 2 ms as padding to weed out false positives

/**
 * DeviceMotionEvent/DeviceOrientationEvent based sensor, conforms to Sensor api above
 */
export class DeviceMotionSensor extends EventEmitter {
  static trigger = () => {
    // Safari needs permission to be acquired within a user action
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      return DeviceMotionEvent.requestPermission();
    }
  };

  constructor(name, Event, event, shortComponents, mapComponents) {
    super();
    this.name = name;
    this._Event = Event;
    this._event = event;
    this.shortComponents = shortComponents;
    this._mapComponents = mapComponents;

    this.components = this.shortComponents.map((x) => this.name + x);
    this.inactivityTimer = null;
    this.timeDelta = INITIAL_DELTA;
    this.lastSampleTime = null;

    this.properties = {
      fixedFrequency: true,
    };
  }

  _onInactive = () => {
    this.emit(
      'warn',
      `Event did not fire in the last ${
        Math.round(calcDelay(this.timeDelta) / 100) / 10
      } seconds. Check if your device has the necessary sensors for the event.`
    );
  };

  _handler = (event) => {
    clearTimeout(this.inactivityTimer);
    this.inactivityTimer = setTimeout(
      this._onInactive,
      calcDelay(this.timeDelta)
    );
    if (this.lastSampleTime) {
      this.timeDelta = Date.now() - this.lastSampleTime;
    }
    this.lastSampleTime = Date.now();

    this.emit('data', this._mapComponents(this, undefined, event), {
      timestamp: Date.now(),
    });
  };

  listen = async (opts = {}) => {
    this.stop();
    this.inactivityTimer = setTimeout(
      this._onInactive,
      calcDelay(this.timeDelta)
    );

    try {
      if (typeof this._Event.requestPermission === 'function') {
        const response = await this._Event.requestPermission();
        if (response == 'granted') {
          window.addEventListener(this._event, this._handler);
        } else {
          throw new Error(`Permission to ${this.name}Event was denied.`);
        }
      } else {
        window.addEventListener(this._event, this._handler);
      }
    } catch (error) {
      this.stop();
      this.emit('error', error.message);
    }
  };

  stop = () => {
    clearTimeout(this.inactivityTimer);
    window.removeEventListener(this._event, this._handler);
  };

  detection = () => this._Event;
}
