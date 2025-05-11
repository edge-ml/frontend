// This class is the original edge-ml bluetooth protocol handler

import BLEHandler from "./BleHandler";
import { readCharArray, convert_type } from "../../../utils/ble";
import { floatToBytes, intToBytes } from "../../../services/bleService";

class BLEDeviceHandlerV1 extends BLEHandler {
    constructor(device) {
        super();
        this.device = device;
    }

    static sensorServiceUuid = "34c2e3bb-34aa-11eb-adc1-0242ac120002";
    static parseInfoServiceUuid = "caa25cb7-7e1b-44f2-adc9-e8c06c9ced43";
    static sensorConfigCharacteristicUuid = "34c2e3bd-34aa-11eb-adc1-0242ac120002";
    static sensorDataCharacteristicUuid = "34c2e3bc-34aa-11eb-adc1-0242ac120002";
    static deviceInfoServiceUuid = "45622510-6468-465a-b141-0b9b0f96b468";
    static deviceIdentifierUuid = "45622511-6468-465a-b141-0b9b0f96b468";
    static deviceGenerationUuid = "45622512-6468-465a-b141-0b9b0f96b468";
    static deviceParseSchemaUuid = "caa25cb8-7e1b-44f2-adc9-e8c06c9ced43";


    static getServiceUUIDs () {
        return [
            BLEDeviceHandlerV1.sensorServiceUuid,
            BLEDeviceHandlerV1.parseInfoServiceUuid,
            BLEDeviceHandlerV1.deviceInfoServiceUuid,
        ]
    }

    get_parse_schema(dataView) {
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
            component_name_length
          );
          cursor = cursor + component_name_length;
          const unit_length = dataView.getUint8(cursor++);
          const unit = readCharArray(dataView, cursor, unit_length);
          cursor = cursor + unit_length;
          parseScheme.push({
            name: group_name + "_" + component_name,
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

    async configureSensor(sensorId, sampleRate, latency) {
      if (!this.device.gatt.connected) {
        return;
      }
      var configPacket = new Uint8Array(9);
      configPacket[0] = sensorId;
      configPacket.set(floatToBytes(sampleRate), 1);
      configPacket.set(intToBytes(latency), 5);
      await this.sensorConfigCharacteristic.writeValue(configPacket);
    }

    static checkDevice() {
        // Defualt class
        return true;
    }

    async getSensorConfig() {
      const gattServer = this.device.gatt;
      const deviceParseSchemaService = await gattServer.getPrimaryService(BLEDeviceHandlerV1.parseInfoServiceUuid);
      const parsingSchemaCharacteristic = await deviceParseSchemaService.getCharacteristic(BLEDeviceHandlerV1.deviceParseSchemaUuid);
      const parsingSchemaBuffer = await parsingSchemaCharacteristic.readValue();
      const sensorSchema = this.get_parse_schema(parsingSchemaBuffer);
      return sensorSchema;
    }




}

export default BLEDeviceHandlerV1;
