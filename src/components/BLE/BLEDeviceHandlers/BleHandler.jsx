class BLEHandler {
  constructor() {
    this.device = null;
  }

  async _getChracteristic(serviceUuid, characteristicUuid) {
    if (!this.device || !this.device.gatt || !this.device.gatt.connected) {
      return null;
    }
    try {
      const service = await this.device.gatt.getPrimaryService(serviceUuid);
      const characteristic = await service.getCharacteristic(characteristicUuid);
      return characteristic;
    } catch (error) {
      console.error(`Error getting characteristic ${characteristicUuid}:`, error);
      return null;
    }
  }


  checkDevice() {
    throw new Error('checkDevice() must be implemented by subclass');
  }

  getSensorConfig() {
    throw new Error('getSensorConfig() must be implemented by subclass');
  }
}

export default BLEHandler;
