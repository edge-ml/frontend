export const parseData = (sensor, data) => {
  var scheme = sensor.parseScheme;
  // 1 byte sensor, 1 byte size, 4 bytes timestamp in milliseconds, the the data starting from 6th byte
  var dataIndex = 6;
  var value = 0;
  var values = [];
  scheme.forEach((element) => {
    //var name = element['name'];
    var valueType = element.type;
    var scale = element.scaleFactor || 1;
    var size = 0;

    if (valueType == "uint8") {
      value = data.getUint8(dataIndex, true) * scale;
      size = 1;
    } else if (valueType == "int8") {
      value = data.getInt8(dataIndex, true) * scale;
      size = 1;
    } else if (valueType == "uint24") {
      value =
        data.getUint16(dataIndex, true) +
        (data.getUint8(dataIndex + 2, true) << 16);
      size = 3;
    } else if (valueType == "uint32") {
      value =
        data.getUint16(dataIndex, true) +
        (data.getUint16(dataIndex + 2, true) << 16);
      size = 4;
    } else if (valueType == "int16") {
      value = data.getInt16(dataIndex, true) * scale;
      size = 2;
    } else if (valueType == "uint16") {
      value = data.getUint16(dataIndex, true) * scale;
      size = 2;
    } else if (valueType == "float") {
      value = data.getFloat32(dataIndex, true) * scale;
      size = 4;
    } else {
    }
    values.push(value);
    dataIndex += size;
  });
  return values;
};

export const parseDataV2 = (sensor, dataBuffer) => {
  let byteIndex = 0;
  const dataView = new DataView(dataBuffer.buffer || dataBuffer);

  const sensorId = dataView.getUint8(byteIndex);
  byteIndex += 2; // skip 1 byte sensorId + 1 byte size (as in Flutter)
  const timestampLow = dataView.getUint32(byteIndex, true);
  byteIndex += 4;
  const timestampHigh = dataView.getUint32(byteIndex, true);
  byteIndex += 4;
  const timestamp = (BigInt(timestampHigh) << 32n) + BigInt(timestampLow);
  // Convert to milliseconds
  const timestampInMs = Number(timestamp) / 1000;


  var schema = sensor.parseScheme;
  const values = [];

  for (const component of schema) {
    let parsedValue;
    switch (component.type) {
      case 0: // int8
        parsedValue = dataView.getInt8(byteIndex);
        byteIndex += 1;
        break;
      case 1: // uint8
        parsedValue = dataView.getUint8(byteIndex);
        byteIndex += 1;
        break;
      case 2: // int16
        parsedValue = dataView.getInt16(byteIndex, true);
        byteIndex += 2;
        break;
      case 3: // uint16
        parsedValue = dataView.getUint16(byteIndex, true);
        byteIndex += 2;
        break;
      case 4: // int32
        parsedValue = dataView.getInt32(byteIndex, true);
        byteIndex += 4;
        break;
      case 5: // uint32
        parsedValue = dataView.getUint32(byteIndex, true);
        byteIndex += 4;
        break;
      case 6: // float
        parsedValue = dataView.getFloat32(byteIndex, true);
        byteIndex += 4;
        break;
      case 7: // double
        parsedValue = dataView.getFloat64(byteIndex, true);
        byteIndex += 8;
        break;
      default:
        throw new Error(`Unknown parse type: ${component.type}`);
    }
    values.push(parsedValue);
  }
  return [timestampInMs, values];
};

export const floatToBytes = (value) => {
  var tempArray = new Float32Array(1);
  tempArray[0] = value;
  return new Uint8Array(tempArray.buffer);
};

export const intToBytes = (value) => {
  var tempArray = new Int32Array(1);
  tempArray[0] = value;
  return new Uint8Array(tempArray.buffer);
};

export const prepareSensorBleObject = (sensorArray) => {
  const result = {};
  sensorArray.forEach((elm) => {
    const bleKey = elm.bleKey;
    delete elm.bleKey;
    result[bleKey] = elm;
  });
  return result;
};

export const prepareSensorBleObjectV2 = (sensorArray) => {
  const result = {};
  console.log("SensorArray", sensorArray)
  sensorArray.forEach((elm) => {
    result[elm.sensorId] = {
      name: elm.sensorName,
      options: elm.options,
      parseScheme: elm.components.map((component) => {
        return {
          name: component.componentName,
          unit: component.unitName,
          type: component.type,
        };
      }),
    };
  });
  return result;
};

export const getBaseDataset = (sensors, datasetName) => {
  const timeSeries = [];
  Object.keys(sensors).forEach((sensorId) => {
    const sensor = sensors[sensorId];
    sensor.parseScheme.forEach((scheme, schema_idx) => {
      const schemeName = scheme.name.startsWith(sensor.name + "_")
        ? scheme.name
        : sensor.name + "_" + scheme.name;
      const ts_name = schemeName;
      console.log("ts_name", ts_name);
      timeSeries.push({
        name: ts_name,
        unit: scheme.unit,
        start: new Date().getTime() + 10000000,
        end: new Date().getTime(),
        data: [],
      });
    });

    // Assert that all timeSeris have unique names
    const uniqueNames = new Set();
    timeSeries.forEach((ts) => {
      if (uniqueNames.has(ts.name)) {
        throw new Error(`Duplicate time series name: ${ts.name}`);
      }
      uniqueNames.add(ts.name);
    });


  });
  return {
    name: datasetName,
    start: new Date().getTime() + 10000000,
    end: new Date().getTime(),
    timeSeries: timeSeries,
  };
};

export const parseTimeSeriesData = (
  dataset,
  recordedData,
  recordingSensors,
  sensors
) => {
  const timeSeries = [];
  const sensorData = {};
  [...recordingSensors].forEach((sensorKey) => {
    sensorData[sensorKey] = recordedData.filter(
      (elm) => elm.sensor.toString() === sensorKey.toString()
    );
  });
  Object.keys(sensorData).forEach((key) => {
    const sensor = sensors[key];
    sensor.parseScheme.forEach((scheme, idx) => {
      const data = sensorData[key].map((elm) => {
        return [elm.time, elm.data[idx]];
      });
      console.log("Timeseries", dataset.timeSeries)
      console.log("Finding:", sensor.name + "_" + key + "_" + idx + "_" + scheme.name)
      timeSeries.push({
        _id: dataset.timeSeries.find((elm) => {
          const schemeName = scheme.name.startsWith(sensor.name + "_")
            ? scheme.name
            : sensor.name + "_" + scheme.name;
          return elm.name === schemeName;
        })._id,
        data: data,
      });
    });
  });
  return timeSeries;
};
