module.exports.parseData = (sensorKey, data) => {
  const sensor = this.findSensorByKey(sensorKey);
  var type = sensor.type;
  var sensorName = sensor.name;
  var scheme = this.state.deviceInfo.scheme.find(elm => elm.id === type)
    .parseScheme;
  //var scheme = parseScheme["types"][type]["parse-scheme"];
  var result = '';

  // dataIndex start from 2 because the first bytes of the packet indicate
  // the sensor id and the data size
  var dataIndex = 0 + 2;
  var value = 0;
  var values = [];
  scheme.forEach(element => {
    var name = element['name'];
    var valueType = element.type;
    var scale = element.scaleFactor;
    var size = 0;

    if (valueType == 'uint8') {
      value = data.getUint8(dataIndex, true) * scale;
      size = 1;
    } else if (valueType == 'uint24') {
      value =
        data.getUint16(dataIndex, true) +
        (data.getUint8(dataIndex + 2, true) << 16);
      size = 3;
    } else if (valueType == 'uint32') {
      value =
        data.getUint16(dataIndex, true) +
        (data.getUint16(dataIndex + 2, true) << 16);
      size = 4;
    } else if (valueType == 'int16') {
      value = data.getInt16(dataIndex, true) * scale;
      size = 2;
    } else if (valueType == 'float') {
      value = data.getFloat32(dataIndex, true) * scale;
      size = 4;
    } else {
      console.log('Error: unknown type');
    }
    result = result + element.name + ': ' + value + '   ';
    values.push(value);
    dataIndex += size;
  });
  return [sensorName, result, values];
};

module.exports.floatToBytes = value => {
  var tempArray = new Float32Array(1);
  tempArray[0] = value;
  return new Uint8Array(tempArray.buffer);
};

module.exports.intToBytes = value => {
  var tempArray = new Int32Array(1);
  tempArray[0] = value;
  return new Uint8Array(tempArray.buffer);
};

module.exports.prepareSensorBleObject = sensorArray => {
  const result = {};
  sensorArray.forEach(elm => {
    const bleKey = elm.bleKey;
    delete elm.bleKey;
    result[bleKey] = elm;
  });
  return result;
};

module.exports.findDeviceIdById = (devices, deviceName) => {
  return devices.find(
    elm => deviceName.toLowerCase() === elm.name.toLowerCase()
  )._id;
};
