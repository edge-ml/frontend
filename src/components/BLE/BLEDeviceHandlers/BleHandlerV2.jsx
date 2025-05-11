// This file handles the BLE connection for the new OpenEarable protocol.

class BLEDeviceHandlerV2 {
    constructor() {
        this.device = null;
    }

    static sensorServiceUuid = "34c2e3bb-34aa-11eb-adc1-0242ac120002";
    static sensorConfigurationCharacteristicUuid = "34c2e3bd-34aa-11eb-adc1-0242ac120002";
    static sensorConfigurationV2CharacteristicUuid = "34c2e3be-34aa-11eb-adc1-0242ac120002";
    static sensorDataCharacteristicUuid = "34c2e3bc-34aa-11eb-adc1-0242ac120002";
    
    static deviceInfoServiceUuid = "45622510-6468-465a-b141-0b9b0f96b468";
    static deviceIdentifierCharacteristicUuid = "45622511-6468-465a-b141-0b9b0f96b468";
    static deviceFirmwareVersionCharacteristicUuid = "45622512-6468-465a-b141-0b9b0f96b468";
    static deviceHardwareVersionCharacteristicUuid = "45622513-6468-465a-b141-0b9b0f96b468";
    
    static parseInfoServiceUuid = "caa25cb7-7e1b-44f2-adc9-e8c06c9ced43";
    static schemeCharacteristicUuid = "caa25cb8-7e1b-44f2-adc9-e8c06c9ced43";
    static sensorListCharacteristicUuid = "caa25cb9-7e1b-44f2-adc9-e8c06c9ced43";
    static requestSensorSchemeCharacteristicUuid = "caa25cba-7e1b-44f2-adc9-e8c06c9ced43";
    static sensorSchemeCharacteristicUuid = "caa25cbb-7e1b-44f2-adc9-e8c06c9ced43";
    
    static audioPlayerServiceUuid = "5669146e-476d-11ee-be56-0242ac120002";


    static async checkDevice(device) {
        if (!device || !device.gatt || !device.gatt.connected) {
            return false;
        }
        try {
            await device.gatt.getPrimaryService(this.audioPlayerServiceUuid);
            return true;
        } catch (error) {
            return false;
        }
    }

    getSensorConfig() {

    }





}

export default BLEDeviceHandlerV2;
