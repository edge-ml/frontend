class BLEHandler {
  constructor() {
    this.device = null;
  }

  checkDevice() {
    throw new Error('checkDevice() must be implemented by subclass');
  }

  getSensorConfig() {
    throw new Error('getSensorConfig() must be implemented by subclass');
  }
}

export default BLEHandler;
