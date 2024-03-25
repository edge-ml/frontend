class ClassificationDevice {
  constructor(device, classificationCharacteristics) {
    this.device = device;
    this.classificationCharacteristics = classificationCharacteristics;
  }

  async notify(callback) {
    await this.classificationCharacteristics.startNotifications();
    this.classificationCharacteristics.addEventListener(
      'characteristicvaluechanged',
      callback,
    );
  }
}

export default ClassificationDevice;
