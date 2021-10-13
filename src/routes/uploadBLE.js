import React, { Component } from 'react';
import {
  Col,
  Row,
  Table,
  Input,
  Button,
  InputGroup,
  Spinner,
  InputGroupAddon,
  InputGroupText
} from 'reactstrap';

import BleNotActivated from '../components/BLE/BleNotActivated';
import BlePanelSensorList from '../components/BLE/BlePanelSensorList';
import BlePanelRecorderSettings from '../components/BLE/BlePanelRecorderSettings';
import BlePanelConnectDevice from '../components/BLE/BlePanelConnectDevice';

import { createDataset } from '../services/ApiServices/DatasetServices';

import {
  getDevices,
  getDeviceById
} from '../services/ApiServices/DeviceService';

import {
  BleDeviceProcessor,
  floatToBytes,
  intToBytes,
  prepareSensorBleObject,
  findDeviceIdById
} from '../services/bleService';

import '../components/BLE/BleActivated.css';

class UploadBLE extends Component {
  constructor(props) {
    super(props);
    this.state = {
      connectedBLEDevice: undefined,
      bleStatus: navigator.bluetooth,
      sampleRate: 50,
      datasetName: '',
      recorderState: 'ready', // ready, startup, recording, finalizing
      devices: undefined,
      deviceSensors: undefined
    };
    this.toggleBLEDeviceConnection = this.toggleBLEDeviceConnection.bind(this);
    this.connectDevice = this.connectDevice.bind(this);
    this.receiveSensorData = this.receiveSensorData.bind(this);
    this.connect = this.connect.bind(this);
    this.onDisconnection = this.onDisconnection.bind(this);
    this.getDeviceInfo = this.getDeviceInfo.bind(this);
    this.getSensorCharacteristics = this.getSensorCharacteristics.bind(this);
    this.onClickRecordButton = this.onClickRecordButton.bind(this);
    this.onLatencyChanged = this.onLatencyChanged.bind(this);
    this.onSampleRateChanged = this.onSampleRateChanged.bind(this);
    this.onToggleSensor = this.onToggleSensor.bind(this);
    this.onGlobalSampleRateChanged = this.onGlobalSampleRateChanged.bind(this);
    this.onDatasetNameChanged = this.onDatasetNameChanged.bind(this);

    this.baseState = this.state;

    this.recorderMap = undefined;
    this.recorderDataset = undefined;
    this.recordInterval;

    // Global vars to manage ble connnection
    this.sensorConfigCharacteristic;
    this.sensorDataCharacteristic;
    this.sensorServiceUuid = '34c2e3bb-34aa-11eb-adc1-0242ac120002';
    this.sensorConfigCharacteristicUuid =
      '34c2e3bd-34aa-11eb-adc1-0242ac120002';
    this.sensorDataCharacteristicUuid = '34c2e3bc-34aa-11eb-adc1-0242ac120002';
    this.bleDeviceProcessor = undefined;
  }

  componentDidMount() {
    getDevices().then(data => {
      this.setState({
        devices: data
      });
    });
  }

  onDatasetNameChanged(e) {
    this.setState({
      datasetName: e.target.value
    });
  }

  onGlobalSampleRateChanged(e) {
    this.setState({
      sampleRate: e.target.value
    });
  }

  onToggleSensor(sensorId) {
    if (this.state.sensorMap.get(sensorId)) {
      this.setState(prevState => {
        const nextSensorMap = new Map(prevState.sensorMap);
        nextSensorMap.delete(sensorId);
        return { sensorMap: nextSensorMap };
      });
    } else {
      this.setState(prevState => {
        const nextSensorMap = new Map(prevState.sensorMap);
        nextSensorMap.set(sensorId, { latency: 0, sampleRate: 1 });
        return { sensorMap: nextSensorMap };
      });
    }
  }

  onLatencyChanged(sensorId, latency) {
    this.setState(prevState => {
      const nextSensorMap = new Map(prevState.sensorMap);
      const data = nextSensorMap.get(sensorId);
      data.latency = latency;
      nextSensorMap.set(sensorId, data);
      return { sensorMap: nextSensorMap };
    });
  }

  onSampleRateChanged(sensorId, sampleRate) {
    this.setState(prevState => {
      const nextSensorMap = new Map(prevState.sensorMap);
      const data = nextSensorMap.get(sensorId);
      data.sampleRate = sampleRate;
      nextSensorMap.set(sensorId, data);
      return { sensorMap: nextSensorMap };
    });
  }

  async onClickRecordButton() {
    // ready, startup, recording, finalizing
    switch (this.state.recorderState) {
      case 'ready':
        this.setState({ recorderState: 'startup' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.setState({ recorderState: 'recording' });

        break;
      case 'recording':
        this.setState({ recorderState: 'finalizing' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.setState({ recorderState: 'ready' });
        break;
    }
  }

  /*async onStartRecording() {
    if (this.recordInterval) {
      this.setState({ recordReady: false });
      clearInterval(this.recordInterval);
      this.recordInterval = undefined;
      const globalStartTime = Math.min(
        ...this.recorderDataset.timeSeries.map((elm) => elm.start)
      );
      const globalEndTime = Math.max(
        ...this.recorderDataset.timeSeries.map((elm) => elm.end)
      );
      this.recorderDataset.start = globalStartTime;
      this.recorderDataset.end = globalEndTime;
      console.log(this.recorderDataset);
      createDataset(this.recorderDataset).then(() => {
        console.log("Uploaded dataset");
      });
      this.setState({
        recording: false,
      });
      this.setState({ recordReady: true });
      this.unSubscribeAllSensors();
      return;
    }
    this.setState({ recordReady: false, recording: true });
    await this.unSubscribeAllSensors();
    this.recorderMap = new Map();
    this.state.sensorMap;
    for (const [key, value] of this.state.sensorMap.entries()) {
      this.recorderMap.set(key, -1);
      //console.log("Samplerate: " + Math.round((1000 / this.state.sampleRate) * 3))
      await this.configureSingleSensor(
        key,
        Math.round((1000 / this.state.sampleRate) * 3),
        value.latency
      );
      const data = await this.sensorDataCharacteristic.readValue();
      this.receiveSensorData(data);
    }
    const timeSeries = [];
    this.state.sensorMap.forEach((value, key) => {
      const sensor = this.findSensorByKey(key);
      const sensorType = this.state.deviceInfo.scheme.find(
        (elm) => elm.id === sensor.type
      );
      sensorType.parseScheme.map((elm) => {
        timeSeries.push({
          name: this.findSensorByKey(key).name + "_" + elm.name,
          start: new Date().getTime() + 10000000,
          end: new Date().getTime(),
          data: [],
        });
      });
    });
    this.recorderDataset = {
      name: this.state.datasetName,
      start: new Date().getTime() + 10000000,
      end: new Date().getTime(),
      timeSeries: timeSeries,
    };
    this.setState({ recordReady: true });
    this.recordInterval = setInterval(() => {
      this.state.sensorMap.forEach((value, key) => {
        const sensor = this.findSensorByKey(key);
        const sensorType = this.state.deviceInfo.scheme.find(
          (elm) => elm.id === sensor.type
        );
        sensorType.parseScheme.map((elm, idx) => {
          if (this.recorderMap.get(key)[idx]) {
            const searchString = sensor.name + "_" + elm.name;
            const timeSeriesData = this.recorderDataset.timeSeries.find(
              (elm) => elm.name === searchString
            );
            const addTime = new Date().getTime();
            timeSeriesData.data.push({
              datapoint: this.recorderMap.get(key)[idx],
              timestamp: addTime,
            });
            if (addTime < timeSeriesData.start) {
              timeSeriesData.start = addTime;
            }
            if (addTime > timeSeriesData.end) {
              timeSeriesData.end = addTime;
            }
          }
        });
      });
    }, this.state.sampleRate);
  }*/

  receiveSensorData(value) {
    if (this.recorderMap) {
      // Get sensor data
      var sensor = value.getUint8(0);
      var size = value.getUint8(1);
      var parsedData = this.parseData(sensor, value);
      var parsedName = parsedData[0];
      var parsedValue = parsedData[1];
      var rawValues = parsedData[2];
      this.recorderMap.set(sensor, rawValues);
    }
  }

  onDisconnection(event) {
    // TODO: Handle emergency dataset upload here
    this.state.connectedBLEDevice.gatt.disconnect();
    this.setState({
      ...this.baseState,
      devices: this.state.devices
    });
  }

  onConnection() {
    console.log('Device is now connected');
  }

  async getDeviceInfo() {
    try {
      let options = {
        filters: [{ services: [this.sensorServiceUuid] }]
      };
      const bleDevice = await navigator.bluetooth.requestDevice(options);
      const deviceInfo = await getDeviceById(
        findDeviceIdById(this.state.devices, bleDevice.name)
      );
      this.setState({
        connectedBLEDevice: bleDevice,
        connectedDeviceData: deviceInfo.device,
        deviceSensors: prepareSensorBleObject(deviceInfo.sensors)
      });
      return bleDevice;
    } catch (error) {
      console.log('Request device error: ' + error);
      if (error.toString().includes('Bluetooth adapter not available')) {
        alert('Activate bluetooth');
      }
    }
  }

  async connectDevice(bleDevice) {
    bleDevice.addEventListener('gattserverdisconnected', this.onDisconnection);
    const primaryService = await bleDevice.gatt.connect().then(server => {
      return server.getPrimaryService(this.sensorServiceUuid);
    });
    return [bleDevice, primaryService];
  }

  async getSensorCharacteristics(data) {
    const [bleDevice, primaryService] = data;
    console.log(bleDevice);
    console.log(primaryService);
    // Get necessary Characteristics from Service
    this.sensorConfigCharacteristic = await primaryService.getCharacteristic(
      this.sensorConfigCharacteristicUuid
    );
    this.sensorDataCharacteristic = await primaryService.getCharacteristic(
      this.sensorDataCharacteristicUuid
    );

    // Subscribe to the sensorData
    this.sensorDataCharacteristic.addEventListener(
      'characteristicvaluechanged',
      event => this.receiveSensorData(event.target.value)
    );
  }

  connect() {
    return this.getDeviceInfo()
      .then(this.connectDevice)
      .then(this.getSensorCharacteristics)
      .then(this.onConnection);
  }

  toggleBLEDeviceConnection() {
    if (this.state.recorderState == 'recording') {
      // TODO: Disconnect device and finalize dataset recording
      return;
    }
    // Case: Connected: Now disconnect
    if (this.state.connectedBLEDevice) {
      this.onDisconnection();
    } else {
      // Case: Not connected, so connect
      this.connect()
        .then(_ => {
          console.log('Connected');
        })
        .catch(error => {
          console.log('ERROR: ' + error);
        });
    }
  }

  render() {
    if (!this.state.bleStatus) {
      return <BleNotActivated></BleNotActivated>;
    }

    return (
      <div className="bleActivatedContainer">
        <BlePanelConnectDevice
          toggleBLEDeviceConnection={this.toggleBLEDeviceConnection}
          connectedBLEDevice={this.state.connectedBLEDevice}
        ></BlePanelConnectDevice>

        {this.state.deviceSensors ? (
          <Row>
            <Col>
              <div className="shadow p-3 mb-5 bg-white rounded">
                <BlePanelSensorList
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
              ></BlePanelRecorderSettings>
            </Col>
          </Row>
        ) : null}
      </div>
    );
  }
}

export default UploadBLE;
