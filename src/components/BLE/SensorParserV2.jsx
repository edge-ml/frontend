class SensorParserV2 {
  constructor(
    device,
    server,
    // serviceUuid,
    // sensorListCharUuid,
    // sensorSchemeCharUuid,
    // requestSensorSchemeCharUuid
  ) {
    this.device = device;
    // this.serviceUuid = serviceUuid;
    // this.sensorListCharUuid = sensorListCharUuid;
    // this.sensorSchemeCharUuid = sensorSchemeCharUuid;
    // this.requestSensorSchemeCharUuid = requestSensorSchemeCharUuid;

    this.serviceUuid = "caa25cb7-7e1b-44f2-adc9-e8c06c9ced43";
    this.sensorListCharUuid = "caa25cb9-7e1b-44f2-adc9-e8c06c9ced43";
    this.sensorSchemeCharUuid = "caa25cbb-7e1b-44f2-adc9-e8c06c9ced43";
    this.requestSensorSchemeCharUuid = "caa25cba-7e1b-44f2-adc9-e8c06c9ced43";

    this.sensorIds = [];
    this.sensorSchemes = new Map();
    this.server = server;
    this.service = null;
  }

  async connect() {
    this.service = await this.server.getPrimaryService(this.serviceUuid);
  }

  async readSensorIds() {
    await this.connect();
    const char = await this.service.getCharacteristic(this.sensorListCharUuid);
    const value = await char.readValue();
    const sensorIdCount = value.getUint8(0);
    this.sensorIds = [];
    for (let i = 1; i <= sensorIdCount; i++) {
      this.sensorIds.push(value.getUint8(i));
    }
  }

  async getSchemeForSensor(sensorId) {
    if (this.sensorIds.length === 0) {
      await this.readSensorIds();
    }
    if (!this.sensorIds.includes(sensorId)) {
      throw new Error(`Sensor with id ${sensorId} does not exist.`);
    }
    if (this.sensorSchemes.has(sensorId)) {
      return this.sensorSchemes.get(sensorId);
    }

    await this.connect();

    const sensorSchemeChar = await this.service.getCharacteristic(
      this.sensorSchemeCharUuid
    );
    const requestChar = await this.service.getCharacteristic(
      this.requestSensorSchemeCharUuid
    );

    return new Promise(async (resolve, reject) => {
      const onCharacteristicValueChanged = (event) => {
        const value = event.target.value;
        const byteArray = new Uint8Array(value.buffer);
        try {
          const scheme = this.parseSensorScheme(byteArray);
          if (scheme.sensorId !== sensorId) {
            reject(
              new Error(
                `Sensor id mismatch. Expected: ${sensorId}, got: ${scheme.sensorId}`
              )
            );
          } else {
            this.sensorSchemes.set(sensorId, scheme);
            sensorSchemeChar.removeEventListener(
              "characteristicvaluechanged",
              onCharacteristicValueChanged
            );
            resolve(scheme);
          }
        } catch (e) {
          reject(e);
        }
      };

      sensorSchemeChar.addEventListener(
        "characteristicvaluechanged",
        onCharacteristicValueChanged
      );
      await sensorSchemeChar.startNotifications();

      // Write the sensorId to request the scheme
      const sensorIdArray = new Uint8Array([sensorId]);
      await requestChar.writeValue(sensorIdArray);

      // Set a timeout for 5 seconds
      setTimeout(() => {
        sensorSchemeChar.removeEventListener(
          "characteristicvaluechanged",
          onCharacteristicValueChanged
        );
        reject(new Error("Timeout while waiting for sensor scheme."));
      }, 5000);
    });
  }

  async readSensorSchemes(forceRead = false) {
    if (this.sensorIds.length === 0 || forceRead) {
      await this.readSensorIds();
    }
    const schemes = [];
    for (const sensorId of this.sensorIds) {
      if (!this.sensorSchemes.has(sensorId) || forceRead) {
        const scheme = await this.getSchemeForSensor(sensorId);
        schemes.push(scheme);
      } else {
        schemes.push(this.sensorSchemes.get(sensorId));
      }
    }
    return schemes;
  }

  parseSensorScheme(byteArray) {
    let currentIndex = 0;
    const sensorId = byteArray[currentIndex++];

    const nameLength = byteArray[currentIndex++];
    const nameBytes = byteArray.slice(currentIndex, currentIndex + nameLength);
    const sensorName = new TextDecoder().decode(nameBytes);
    currentIndex += nameLength;

    const componentCount = byteArray[currentIndex++];

    const components = [];
    for (let j = 0; j < componentCount; j++) {
      const componentType = byteArray[currentIndex++];

      const groupNameLength = byteArray[currentIndex++];
      const groupNameBytes = byteArray.slice(
        currentIndex,
        currentIndex + groupNameLength
      );
      const groupName = new TextDecoder().decode(groupNameBytes);
      currentIndex += groupNameLength;

      const componentNameLength = byteArray[currentIndex++];
      const componentNameBytes = byteArray.slice(
        currentIndex,
        currentIndex + componentNameLength
      );
      const componentName = new TextDecoder().decode(componentNameBytes);
      currentIndex += componentNameLength;

      const unitNameLength = byteArray[currentIndex++];
      const unitNameBytes = byteArray.slice(
        currentIndex,
        currentIndex + unitNameLength
      );
      const unitName = new TextDecoder().decode(unitNameBytes);
      currentIndex += unitNameLength;

      components.push({
        type: componentType,
        groupName,
        componentName,
        unitName,
      });
    }

    const availableFeatures = byteArray[currentIndex++];
    const SensorConfigFeatures = {
      streaming: 0x01,
      recording: 0x02,
      frequencyDefinition: 0x10,
    };
    const features = [];
    for (const [key, value] of Object.entries(SensorConfigFeatures)) {
      if ((availableFeatures & value) === value) {
        features.push(key);
      }
    }

    let frequencies = null;
    if (features.includes("frequencyDefinition")) {
      const frequencyCount = byteArray[currentIndex++];
      const defaultFreqIndex = byteArray[currentIndex++];
      const maxStreamingFreqIndex = byteArray[currentIndex++];
      const freqs = [];
      for (let k = 0; k < frequencyCount; k++) {
        const start = currentIndex + k * 4;
        const freqBytes = byteArray.slice(start, start + 4);
        const freq = new DataView(freqBytes.buffer).getFloat32(0, true);
        freqs.push(freq);
      }
      currentIndex += frequencyCount * 4;
      frequencies = {
        maxStreamingFreqIndex,
        defaultFreqIndex,
        frequencies: freqs,
      };
    }

    return {
      sensorId,
      sensorName,
      componentCount,
      components,
      options: {
        features,
        frequencies,
      },
    };
  }
}

export default SensorParserV2;
