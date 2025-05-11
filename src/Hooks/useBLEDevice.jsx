import { useState, useRef } from "react";
import { getDeviceByNameAndGeneration } from "../services/ApiServices/DeviceService";
import { prepareSensorBleObject } from "../services/bleService";
import { get_parse_schema } from "../utils/ble";
import BleDeviceProcessor from "../components/BLE/BleDeviceProcessor";
import BLEDeviceHandlerV1 from "../components/BLE/BLEDeviceHandlers/BleHandlerV1";
import BLEDeviceHandlerV2 from "../components/BLE/BLEDeviceHandlers/BleHandlerV2";

const useBLEDevice = () => {
  const [connectedDevice, setConnectedDevice] = useState(undefined);

  const handlers = [
    // BLEDeviceHandlerV2,
    BLEDeviceHandlerV1,
  ];

  const getDeviceProcessor = async (device) => {
    for (const handler of handlers) {
      if (await handler.checkDevice(device)) {
        console.log("Device handler found:", handler);
        return new handler(device);
      }
    }
    return null;
  }

  const getOptionalServices = () => {
    return handlers.map((handler) => handler.getServiceUUIDs()).flat();
  };


  const toggleBLEConnection = async () => {
    if (connectedDevice) {
      if (connectedDevice.gatt && connectedDevice.gatt.disconnect) {
        connectedDevice.gatt.disconnect();
      }
      setConnectedDevice(undefined);
    } else {
      if (navigator.bluetooth) {
        try {
          const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: getOptionalServices(),
          });
          await device.gatt.connect();
          const processor = await getDeviceProcessor(device);
          setConnectedDevice(processor);
          if (processor) {
            // You can set the processor to a ref or state here if needed
            // For example: bleDeviceProcessor.current = processor;
          }
          // setConnectedDevice(device);
        } catch (error) {
          console.error("Error requesting Bluetooth device:", error);
        }
      } else {
        console.error("Bluetooth is not supported in this browser.");
      }
    }
  };

  const [bleConnectionChanging, setBleConnectionChanging] = useState(false);
  const [connectedBLEDevice, setConnectedBLEDevice] = useState(undefined);
  const [bleStatus, setBleStatus] = useState(navigator.bluetooth);
  const [deviceSensors, setDeviceSensors] = useState(undefined);
  const [connectedDeviceData, setConnectedDeviceData] = useState(undefined);
  const [deviceNotUsable, setDeviceNotUsable] = useState(false);

  const sensorConfigCharacteristic = useRef(null);
  const sensorDataCharacteristic = useRef(null);
  const bleDeviceProcessor = useRef(undefined);
  const textEncoder = new TextDecoder("utf-8");

  // UUIDs
  const sensorServiceUuid = "34c2e3bb-34aa-11eb-adc1-0242ac120002";
  const parseInfoServiceUuid = "caa25cb7-7e1b-44f2-adc9-e8c06c9ced43";
  const sensorConfigCharacteristicUuid = "34c2e3bd-34aa-11eb-adc1-0242ac120002";
  const sensorDataCharacteristicUuid = "34c2e3bc-34aa-11eb-adc1-0242ac120002";
  const deviceInfoServiceUuid = "45622510-6468-465a-b141-0b9b0f96b468";
  const deviceIdentifierUuid = "45622511-6468-465a-b141-0b9b0f96b468";
  const deviceGenerationUuid = "45622512-6468-465a-b141-0b9b0f96b468";
  const deviceParseSchemaUuid = "caa25cb8-7e1b-44f2-adc9-e8c06c9ced43";

  const delay = async (milliseconds) => {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  };

  const onDisconnection = async () => {
    if (bleDeviceProcessor.current) {
      await bleDeviceProcessor.current.stopRecording();
    }
    if (
      connectedBLEDevice &&
      connectedBLEDevice.gatt &&
      connectedBLEDevice.gatt.disconnect
    ) {
      connectedBLEDevice.gatt.disconnect();
    }
    resetState();
  };

  const resetState = () => {
    setBleConnectionChanging(false);
    setConnectedBLEDevice(undefined);
    setBleStatus(navigator.bluetooth);
    setDeviceSensors(undefined);
    setConnectedDeviceData(undefined);
    setDeviceNotUsable(false);
  };

  const getDeviceInfo = async () => {
    let newOptions = {
      acceptAllDevices: true,
      optionalServices: [
        deviceInfoServiceUuid,
        sensorServiceUuid,
        parseInfoServiceUuid,
      ],
    };
    const bleDevice = await navigator.bluetooth.requestDevice(newOptions);
    return bleDevice;
  };

  const connectToDevice = async (bleDevice, retryCount = 0) => {
    try {
      const server = await bleDevice.gatt.connect();
      return server;
    } catch (error) {
      if (retryCount < 3) {
        setTimeout(() => connectToDevice(bleDevice, retryCount + 1), 4000);
      } else {
        throw error;
      }
    }
  };

  const checkServices = async (bleDevice) => {
    bleDevice.addEventListener("gattserverdisconnected", onDisconnection);

    let hasDeviceInfo = false;
    let hasSensorService = false;
    const server = await connectToDevice(bleDevice, 0);
    const services = await server.getPrimaryServices();
    services.forEach((service) => {
      if (service.uuid === deviceInfoServiceUuid) {
        hasDeviceInfo = true;
      } else if (service.uuid === sensorServiceUuid) {
        hasSensorService = true;
      }
    });

    if (hasDeviceInfo && hasSensorService) {
      // Device usable
    } else {
      setDeviceNotUsable(true);
    }
    return bleDevice;
  };

  const connectDevice = async (bleDevice) => {
    await delay(200);
    const gattServer = await bleDevice.gatt.connect();
    await delay(200);
    const primaryService =
      await gattServer.getPrimaryService(sensorServiceUuid);
    const deviceInfoService = await gattServer.getPrimaryService(
      deviceInfoServiceUuid
    );

    let sensorSchema = undefined;
    const deviceParseSchemaService = await gattServer.getPrimaryService(parseInfoServiceUuid);
    if (deviceParseSchemaService) {
      const parsingSchemaCharacteristic = await deviceParseSchemaService.getCharacteristic(deviceParseSchemaUuid);
      const parsingSchemaBuffer = await parsingSchemaCharacteristic.readValue();
      sensorSchema = get_parse_schema(parsingSchemaBuffer);
    }

    await delay(200);
    const deviceIdentifierCharacteristic =
      await deviceInfoService.getCharacteristic(deviceIdentifierUuid);
    const deviceGenerationCharacteristic =
      await deviceInfoService.getCharacteristic(deviceGenerationUuid);

    const deviceIdentifierArrayBuffer =
      await deviceIdentifierCharacteristic.readValue();
    const deviceGenerationArrayBuffer =
      await deviceGenerationCharacteristic.readValue();
    const deviceName = textEncoder.decode(deviceIdentifierArrayBuffer);
    const deviceGeneration = textEncoder.decode(deviceGenerationArrayBuffer);

    if (!sensorSchema) {
      const deviceInfo = await getDeviceByNameAndGeneration(
        deviceName,
        deviceGeneration
      );
      sensorSchema = deviceInfo.sensors;
      setConnectedDeviceData({
        name: deviceName,
        installedFWVersion: deviceGeneration,
        maxSampleRate: deviceInfo?.maxSampleRate,
      });
    } else {
      setConnectedDeviceData({
        name: deviceName,
        installedFWVersion: deviceGeneration,
      });
    }
    setDeviceSensors(prepareSensorBleObject(sensorSchema));
    return [bleDevice, primaryService];
  };

  const getSensorCharacteristics = async (data) => {
    const [bleDevice, primaryService] = data;
    sensorConfigCharacteristic.current = await primaryService.getCharacteristic(
      sensorConfigCharacteristicUuid
    );
    sensorDataCharacteristic.current = await primaryService.getCharacteristic(
      sensorDataCharacteristicUuid
    );
    bleDeviceProcessor.current = new BleDeviceProcessor(
      bleDevice,
      connectedDeviceData,
      deviceSensors,
      sensorConfigCharacteristic.current,
      sensorDataCharacteristic.current,
      { onDisconnection }
    );
    setConnectedBLEDevice(bleDevice);
  };

  const connect = () => {
    return getDeviceInfo()
      .then(checkServices)
      .then((bleDevice) => {
        connectDevice(bleDevice)
          .then(getSensorCharacteristics)
          .catch(() => {})
          .then(() => {});
      })
      .catch(() => {});
  };

  const toggleBLEDeviceConnection = async () => {
    if (connectedBLEDevice) {
      setBleConnectionChanging(true);
      if (bleDeviceProcessor.current !== undefined) {
        await bleDeviceProcessor.current.unSubscribeAllSensors();
      }
      await onDisconnection();
      setBleConnectionChanging(false);
    } else {
      setBleConnectionChanging(true);
      await connect();
      setBleConnectionChanging(false);
    }
  };

  return {
    connectedDevice,
    toggleBLEConnection,
    getOptionalServices,

    bleConnectionChanging,
    connectedBLEDevice,
    bleStatus,
    deviceSensors,
    connectedDeviceData,
    deviceNotUsable,
    bleDeviceProcessor,
    toggleBLEDeviceConnection,
    onDisconnection,
  };
};

export default useBLEDevice;
