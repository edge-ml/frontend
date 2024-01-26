const readCharArray = (dataView, startByte, numBytes) => {
  const charArray = [];
  for (let i = startByte; i < startByte + numBytes; i++) {
    const byte = dataView.getUint8(i);
    const char = String.fromCharCode(byte);
    charArray.push(char);
  }
  return charArray.join('');
};

const convert_type = (val) => {
  console.log('VAL: ', val);
  const type_map = {
    0: 'int8', // PARSE_TYPE_INT8
    1: 'uint8',

    2: 'int16', // PARSE_TYPE_INT16
    3: 'uint16', // PARSE_TYPE_UINT16

    4: undefined, // PARSE_TYPE_INT32
    5: 'uint32',

    6: 'float',
    7: undefined, // PARSE_TYPE_DOUBLE
  };
  if (type_map[val] == undefined) {
    throw Error('You need to implement this type first: ' + val);
  }
  return type_map[val];
};

export function get_parse_schema(dataView) {
  const num_sensors = dataView.getUint8(0);
  var cursor = 1;
  var sensor_arr = [];
  for (var i = 0; i < num_sensors; i++) {
    const sensor_id = dataView.getUint8(cursor++);
    const sensor_name_length = dataView.getUint8(cursor++);
    const sensor_name = readCharArray(dataView, cursor, sensor_name_length);
    cursor = cursor + sensor_name_length;

    const parseScheme = [];
    const num_compontents = dataView.getUint8(cursor++);
    for (var j = 0; j < num_compontents; j++) {
      const group_type = dataView.getUint8(cursor++);
      const group_length = dataView.getUint8(cursor++);
      const group_name = readCharArray(dataView, cursor, group_length);
      cursor = cursor + group_length;
      const component_name_length = dataView.getUint8(cursor++);
      const component_name = readCharArray(
        dataView,
        cursor,
        component_name_length,
      );
      cursor = cursor + component_name_length;
      const unit_length = dataView.getUint8(cursor++);
      const unit = readCharArray(dataView, cursor, unit_length);
      cursor = cursor + unit_length;
      parseScheme.push({
        name: component_name,
        unit: unit,
        type: convert_type(group_type),
      });
    }
    if (parseScheme.length > 0) {
      sensor_arr.push({
        bleKey: sensor_id,
        name: sensor_name,
        parseScheme: parseScheme,
        sampleRate: 10,
      });
    }
  }
  return JSON.parse(JSON.stringify(sensor_arr));
}
