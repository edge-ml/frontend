class ClassificationDevice {
  constructor(device, classificationCharacteristics) {
    this._device = device;
    this._classificationCharacteristics = classificationCharacteristics;
  }

  async notify(callback) {
    await this._classificationCharacteristics.startNotifications();

    const convert = (event) => {
      const value = event.target.value;
      const int = value.getInt32(0, true);
      callback(int);
    };

    this._classificationCharacteristics.addEventListener(
      'characteristicvaluechanged',
      convert,
    );
  }

  get device() {
    return this._device;
  }

  get classificationCharacteristics() {
    return this._classificationCharacteristics;
  }
}

export default ClassificationDevice;
