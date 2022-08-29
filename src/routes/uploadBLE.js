import React, { Component } from 'react';
import { Col, Row } from 'reactstrap';

import BleNotActivated from '../components/BLE/BleNotActivated';
import BlePanelSensorList from '../components/BLE/BlePanelSensorList';
import BlePanelRecorderSettings from '../components/BLE/BlePanelRecorderSettings';
import BlePanelConnectDevice from '../components/BLE/BlePanelConnectDevice';

import {
  getDevices,
  getDeviceById,
  getDeviceByNameAndGeneration,
} from '../services/ApiServices/DeviceService';

import {
  prepareSensorBleObject,
  findDeviceIdById,
} from '../services/bleService';

import BleDeviceProcessor from '../components/BLE/BleDeviceProcessor';
import BlePanelRecordingDisplay from '../components/BLE/BlePanelRecordingDisplay';

import '../components/BLE/BleActivated.css';
import { ga_connectBluetooth } from '../services/AnalyticsService';

class UploadBLE extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bleConnectionChanging: false,
      connectedBLEDevice: undefined,
      bleStatus: navigator.bluetooth,
      latency: 0,
      datasetName: '',
      recorderState: 'ready', // ready, startup, recording, finalizing
      deviceSensors: undefined,
      connectedDeviceData: undefined,
      selectedSensors: new Set(),
      stream: true,
      fullSampleRate: false,
      hasDFUFunction: false,
      isEdgeMLInstalled: false,
      deviceNotUsable: false,
    };
    this.toggleBLEDeviceConnection = this.toggleBLEDeviceConnection.bind(this);
    this.connectDevice = this.connectDevice.bind(this);
    //this.receiveSensorData = this.receiveSensorData.bind(this);
    this.connect = this.connect.bind(this);
    this.onDisconnection = this.onDisconnection.bind(this);
    this.getDeviceInfo = this.getDeviceInfo.bind(this);
    this.getSensorCharacteristics = this.getSensorCharacteristics.bind(this);
    this.onClickRecordButton = this.onClickRecordButton.bind(this);
    this.onLatencyChanged = this.onLatencyChanged.bind(this);
    this.onToggleSensor = this.onToggleSensor.bind(this);
    this.onGlobalSampleRateChanged = this.onGlobalSampleRateChanged.bind(this);
    this.onDatasetNameChanged = this.onDatasetNameChanged.bind(this);
    this.resetState = this.resetState.bind(this);
    this.onToggleStream = this.onToggleStream.bind(this);
    this.onToggleSampleRate = this.onToggleSampleRate.bind(this);
    this.setCurrentData = this.setCurrentData.bind(this);
    this.onChangeSampleRate = this.onChangeSampleRate.bind(this);
    this.onConnection = this.onConnection.bind(this);
    this.connect = this.connect.bind(this);
    this.checkServices = this.checkServices.bind(this);

    this.recorderMap = undefined;
    this.recorderDataset = undefined;
    this.recordInterval;
    this.currentData = [];
    this.sensorKeys = [];

    // Global vars to manage ble connnection
    this.dfuServiceUuid = '34c2e3b8-34aa-11eb-adc1-0242ac120002';
    this.dfuInternalCharacteristicUuid = '34c2e3b9-34aa-11eb-adc1-0242ac120002';
    this.dfuExternalCharacteristicUuid = '34c2e3ba-34aa-11eb-adc1-0242ac120002';
    this.dfuInternalCharacteristic;
    this.dfuExternalCharacteristic;

    this.sensorConfigCharacteristic;
    this.sensorDataCharacteristic;
    this.sensorServiceUuid = '34c2e3bb-34aa-11eb-adc1-0242ac120002';
    this.sensorConfigCharacteristicUuid =
      '34c2e3bd-34aa-11eb-adc1-0242ac120002';
    this.sensorDataCharacteristicUuid = '34c2e3bc-34aa-11eb-adc1-0242ac120002';
    this.deviceInfoServiceUuid = '45622510-6468-465a-b141-0b9b0f96b468';
    this.deviceIdentifierUuid = '45622511-6468-465a-b141-0b9b0f96b468';
    this.deviceGenerationUuid = '45622512-6468-465a-b141-0b9b0f96b468';
    this.bleDeviceProcessor = undefined;
    this.textEncoder = new TextDecoder('utf-8');
  }

  onChangeSampleRate(bleKey, sampleRate) {
    const tmpDeviceSensors = this.state.deviceSensors;
    tmpDeviceSensors[bleKey].sampleRate = parseInt(sampleRate);
    console.log(tmpDeviceSensors);
    this.setState({
      deviceSensors: tmpDeviceSensors,
    });
  }

  onDatasetNameChanged(e) {
    this.setState({
      datasetName: e.target.value,
    });
  }

  onGlobalSampleRateChanged(e) {
    this.setState({
      sampleRate: e.target.value,
    });
  }

  resetState() {
    this.setState({
      bleConnectionChanging: false,
      connectedBLEDevice: undefined,
      bleStatus: navigator.bluetooth,
      latency: 0,
      datasetName: '',
      recorderState: 'ready',
      deviceSensors: undefined,
      connectedDeviceData: undefined,
      selectedSensors: new Set(),
      stream: true,
      hasDFUFunction: false,
      isEdgeMLInstalled: false,
      deviceNotUsable: false,
    });
  }

  onToggleSensor(sensorBleKey) {
    const tmpSelectedSensors = this.state.selectedSensors;
    if (tmpSelectedSensors.has(sensorBleKey)) {
      tmpSelectedSensors.delete(sensorBleKey);
    } else {
      tmpSelectedSensors.add(sensorBleKey);
    }
    this.setState({
      selectedSensors: tmpSelectedSensors,
    });
  }

  onToggleStream() {
    const stream = this.state.stream;
    this.setState({
      stream: !stream,
    });
  }

  onToggleSampleRate() {
    const fullSampleRate = this.state.fullSampleRate;
    this.setState({
      fullSampleRate: !fullSampleRate,
    });
  }

  onLatencyChanged(sensorId, latency) {
    this.setState((prevState) => {
      const nextSensorMap = new Map(prevState.sensorMap);
      const data = nextSensorMap.get(sensorId);
      data.latency = latency;
      nextSensorMap.set(sensorId, data);
      return { sensorMap: nextSensorMap };
    });
  }

  async onClickRecordButton() {
    // ready, startup, recording, finalizing
    switch (this.state.recorderState) {
      case 'ready':
        this.setState({ recorderState: 'startup' });
        await this.bleDeviceProcessor.startRecording(
          this.state.selectedSensors,
          this.state.latency,
          this.state.datasetName
        );
        this.setState({ recorderState: 'recording' });
        break;
      case 'recording':
        this.setState({ recorderState: 'finalizing' });
        await this.bleDeviceProcessor.stopRecording();
        // Upload dataset here
        await new Promise((resolve) => setTimeout(resolve, 1000));
        this.setState({ recorderState: 'ready' });
        break;
    }
  }

  async onDisconnection(event) {
    // TODO: Handle emergency dataset upload here
    if (this.state.recorderState === 'recording') {
      await this.bleDeviceProcessor.stopRecording();
    }
    if (
      this.state.connectedBLEDevice &&
      this.state.connectedBLEDevice.gatt &&
      this.state.connectedBLEDevice.gatt.disconnect
    ) {
      this.state.connectedBLEDevice.gatt.disconnect();
    }
    this.resetState();
  }

  onConnection() {
    this.currentData = new Array(Object.keys(this.state.deviceSensors).length);
    this.sensorKeys = Object.keys(this.state.deviceSensors);
    console.log('Device is now connected');
    ga_connectBluetooth(this.state.connectedDeviceData, '', true);
  }

  async getDeviceInfo() {
    let options = {
      filters: [{ services: [this.deviceInfoServiceUuid] }],
      optionalServices: [this.sensorServiceUuid],
    };
    let newOptions = {
      acceptAllDevices: true,
      optionalServices: [
        this.deviceInfoServiceUuid,
        this.sensorServiceUuid,
        this.dfuServiceUuid,
      ],
    };
    //const bleDevice = await navigator.bluetooth.requestDevice(options);
    const bleDevice = await navigator.bluetooth.requestDevice(newOptions);
    return bleDevice;
  }

  async connectDevice(bleDevice) {
    //bleDevice.addEventListener('gattserverdisconnected', this.onDisconnection);
    const primaryService = await bleDevice.gatt.connect().then((server) => {
      return server.getPrimaryService(this.sensorServiceUuid);
    });
    const deviceInfoService = await bleDevice.gatt.connect().then((server) => {
      return server.getPrimaryService(this.deviceInfoServiceUuid);
    });
    const deviceIdentifierCharacteristic =
      await deviceInfoService.getCharacteristic(this.deviceIdentifierUuid);
    const deviceGenerationCharacteristic =
      await deviceInfoService.getCharacteristic(this.deviceGenerationUuid);
    const deviceIdentifierArrayBuffer =
      await deviceIdentifierCharacteristic.readValue();
    const deviceGenerationArrayBuffer =
      await deviceGenerationCharacteristic.readValue();
    const deviceName = this.textEncoder.decode(deviceIdentifierArrayBuffer);
    const deviceGeneration = this.textEncoder.decode(
      deviceGenerationArrayBuffer
    );
    const deviceInfo = await getDeviceByNameAndGeneration(
      deviceName,
      deviceGeneration
    );
    console.log(deviceInfo);
    this.setState({
      connectedDeviceData: deviceInfo.device,
      deviceSensors: prepareSensorBleObject(deviceInfo.sensors),
    });
    return [bleDevice, primaryService];
  }

  async getSensorCharacteristics(data) {
    const [bleDevice, primaryService] = data;
    // Get necessary Characteristics from Service
    this.sensorConfigCharacteristic = await primaryService.getCharacteristic(
      this.sensorConfigCharacteristicUuid
    );
    this.sensorDataCharacteristic = await primaryService.getCharacteristic(
      this.sensorDataCharacteristicUuid
    );
    this.bleDeviceProcessor = new BleDeviceProcessor(
      bleDevice,
      this.state.connectedDeviceData,
      this.state.deviceSensors,
      this.sensorConfigCharacteristic,
      this.sensorDataCharacteristic,
      this
    );
    this.setState({
      connectedBLEDevice: bleDevice,
    });
  }

  async checkServices(bleDevice) {
    bleDevice.addEventListener('gattserverdisconnected', this.onDisconnection);
    //check for available services
    let hasDeviceInfo = false;
    let hasDFUFunction = false;
    let hasSensorService = false;
    const server = await bleDevice.gatt.connect();
    const services = await server.getPrimaryServices();
    services.forEach((service) => {
      if (service.uuid === this.deviceInfoServiceUuid) {
        hasDeviceInfo = true;
      } else if (service.uuid === this.dfuServiceUuid) {
        hasDFUFunction = true;
      } else if (service.uuid === this.sensorServiceUuid) {
        hasSensorService = true;
      }
    });

    let promisedSetState = (newState) =>
      new Promise((resolve) => this.setState(newState, resolve));

    if (hasDeviceInfo && hasSensorService && this.hasDFUFunction) {
      await promisedSetState({ isEdgeMLInstalled: true, hasDFUFunction: true });
    } else if (hasDFUFunction) {
      await promisedSetState({ hasDFUFunction: true });
    } else if (hasDeviceInfo && hasSensorService) {
      await promisedSetState({ isEdgeMLInstalled: true });
    } else {
      await promisedSetState({ deviceNotUsable: true });
    }
    return bleDevice;
  }

  connect() {
    return this.getDeviceInfo()
      .then(this.checkServices)
      .then((bleDevice) => {
        console.log(this.state.deviceNotUsable);
        console.log(this.state.hasDFUFunction);
        console.log(this.state.isEdgeMLInstalled);
        if (this.state.isEdgeMLInstalled) {
          this.connectDevice(bleDevice)
            .then(this.getSensorCharacteristics)
            .then(this.onConnection)
            .catch((err) => {
              console.log(err);
              ga_connectBluetooth(this.state.connectedDeviceData, err, false);
            });
        } else {
          //handle possibility of flashing firmware or show incompatibility of device
          this.setState({ connectedBLEDevice: bleDevice });
        }
      });
  }

  setCurrentData(sensorData) {
    this.currentData[this.sensorKeys.indexOf(sensorData['sensor'].toString())] =
      [sensorData['time'], sensorData['data']];
  }

  async toggleBLEDeviceConnection() {
    // Case: Connected: Now disconnect
    if (this.state.connectedBLEDevice) {
      this.setState({ bleConnectionChanging: true });
      if (this.state.bleDeviceProcessor !== undefined) {
        await this.bleDeviceProcessor.unSubscribeAllSensors();
      }
      this.onDisconnection();
      this.setState({ bleConnectionChanging: false });
    } else {
      // Case: Not connected, so connect
      this.setState({ bleConnectionChanging: true });
      await this.connect();
      this.setState({ bleConnectionChanging: false });
    }
  }

  render() {
    if (!this.state.bleStatus) {
      return <BleNotActivated></BleNotActivated>;
    }

    return (
      <div className="bleActivatedContainer">
        <BlePanelConnectDevice
          bleConnectionChanging={this.state.bleConnectionChanging}
          toggleBLEDeviceConnection={this.toggleBLEDeviceConnection}
          connectedBLEDevice={this.state.connectedBLEDevice}
          hasDFUFunction={this.state.hasDFUFunction}
        ></BlePanelConnectDevice>
        {this.state.deviceSensors &&
        this.state.connectedBLEDevice &&
        this.state.isEdgeMLInstalled ? (
          <Row>
            <Col>
              <div className="shadow p-3 mb-5 bg-white rounded">
                <BlePanelSensorList
                  maxSampleRate={this.state.connectedDeviceData.maxSampleRate}
                  selectedSensors={this.state.selectedSensors}
                  onChangeSampleRate={this.onChangeSampleRate}
                  sensors={this.state.deviceSensors}
                  onToggleSensor={this.onToggleSensor}
                  disabled={this.state.recorderState !== 'ready'}
                ></BlePanelSensorList>
              </div>
            </Col>
            <Col>
              <BlePanelRecorderSettings
                onDatasetNameChanged={this.onDatasetNameChanged}
                onGlobalSampleRateChanged={this.onGlobalSampleRateChanged}
                datasetName={this.state.datasetName}
                sampleRate={this.state.sampleRate}
                onClickRecordButton={this.onClickRecordButton}
                recorderState={this.state.recorderState}
                sensorsSelected={this.state.selectedSensors.size > 0}
                onToggleStream={this.onToggleStream}
                onToggleSampleRate={this.onToggleSampleRate}
                fullSampleRate={this.state.fullSampleRate}
              ></BlePanelRecorderSettings>
              {this.state.recorderState === 'recording' && this.state.stream ? (
                <div className="shadow p-3 mb-5 bg-white rounded">
                  <BlePanelRecordingDisplay
                    deviceSensors={this.state.deviceSensors}
                    selectedSensors={this.state.selectedSensors}
                    lastData={this.currentData}
                    sensorKeys={this.sensorKeys}
                    fullSampleRate={this.state.fullSampleRate}
                  ></BlePanelRecordingDisplay>
                </div>
              ) : null}
            </Col>
          </Row>
        ) : null}
      </div>
    );
  }
}

export default UploadBLE;
