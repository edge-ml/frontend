import EventEmitter from 'events';

/**
 * DeviceMotionEvent/DeviceOrientationEvent based sensor for ios devices, conforms to Sensor api above
 */
export class IOSSafariSensor extends EventEmitter {
  constructor(name, Event, event, shortComponents, mapComponents) {
    super();
    this.name = name;
    this._Event = Event;
    this._event = event;
    this.shortComponents = shortComponents;
    this._mapComponents = mapComponents;

    this.components = this.shortComponents.map((x) => this.name + x);

    this.properties = {
      fixedFrequency: true,
    };
  }

  _handler = (event) => {
    console.log(event);
    this.emit('data', this._mapComponents(this, undefined, event), {
      timestamp: Date.now(),
    });
  };

  listen = async (opts = {}) => {
    this.stop();

    try {
      this._Event.requestPermission().then((response) => {
        if (response == 'granted') {
          console.log('resp most lovely');
          window.addEventListener(this._event, this._handler);
        }
      });
    } catch (error) {
      this.stop();
      this.emit('error', error.message);
    }
  };

  stop = () => {
    window.removeEventListener(this._event, this._handler);
  };

  detection = () => this._Event.requestPermission;
}
