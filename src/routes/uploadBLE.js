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
import { getLatestEdgeMLVersionNumber } from '../services/ApiServices/ArduinoFirmwareServices';
import DFUModal from '../components/BLE/DFUModal/DFUModal';

import semverLt from 'semver/functions/lt';
import { adjectives, names } from './export/nameGeneration';
import { uniqueNamesGenerator } from 'unique-names-generator';
import { BleLabelingMenu } from '../components/BLE/BleLabelingMenu';

import { subscribeLabelingsAndLabels } from '../services/ApiServices/LabelingServices';

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
      showDFUModal: false,
      latestEdgeMLVersion: undefined,
      outdatedVersionInstalled: false,
      labelings: [],
      selectedLabeling: undefined,
      selectedLabel: undefined, // represents the selected label badge
      activeLabel: undefined, // represents the selected label used when the labeling on plot started
      labelingStart: undefined,
      labelingEnd: undefined,
      labelingPlotId: 0,
    };

    this.componentRef = React.createRef();
    this.labelingData = React.createRef();

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
    this.checkServicesAndGetLatestFWVersion =
      this.checkServicesAndGetLatestFWVersion.bind(this);
    this.toggleDFUModal = this.toggleDFUModal.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.fetchLabelings = this.fetchLabelings.bind(this);
    this.handleLabelingSelect = this.handleLabelingSelect.bind(this);
    this.handleLabelSelect = this.handleLabelSelect.bind(this);
    this.toggleLabelingActive = this.toggleLabelingActive.bind(this);

    this.recorderMap = undefined;
    this.recorderDataset = undefined;
    this.recordInterval = null;
    this.currentData = [];
    this.sensorKeys = [];

    // Global vars to manage ble connnection
    this.dfuServiceUuid = '34c2e3b8-34aa-11eb-adc1-0242ac120002';

    this.sensorConfigCharacteristic = null;
    this.sensorDataCharacteristic = null;
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
      showDFUModal: false,
      latestEdgeMLVersion: undefined,
      outdatedVersionInstalled: false,
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

  async setDatasetName(datasetName) {
    let promisedSetState = (newState) =>
      new Promise((resolve) => this.setState(newState, resolve));
    await promisedSetState({ datasetName: datasetName });
  }

  async onClickRecordButton() {
    // ready, startup, recording, finalizing
    switch (this.state.recorderState) {
      case 'ready':
        if (this.state.datasetName === '') {
          await this.setDatasetName(
            uniqueNamesGenerator({
              dictionaries: [adjectives, names],
              length: 2,
            })
          );
        }
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
        this.setState({ datasetName: '' });
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
      optionalServices: [
        this.deviceInfoServiceUuid,
        this.sensorServiceUuid,
        this.dfuServiceUuid,
      ],
    };
    let newOptions = {
      acceptAllDevices: true,
      optionalServices: [
        this.deviceInfoServiceUuid,
        this.sensorServiceUuid,
        this.dfuServiceUuid,
      ],
    };
    const bleDevice = await navigator.bluetooth.requestDevice(newOptions);
    console.log(bleDevice);
    return bleDevice;
  }

  async connectDevice(bleDevice) {
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
      connectedDeviceData: {
        ...deviceInfo.device,
        installedFWVersion: deviceGeneration,
      },
      deviceSensors: prepareSensorBleObject(deviceInfo.sensors),
      outdatedVersionInstalled: semverLt(
        deviceGeneration,
        this.state.latestEdgeMLVersion
      ),
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

  async checkServicesAndGetLatestFWVersion(bleDevice) {
    bleDevice.addEventListener('gattserverdisconnected', this.onDisconnection);
    let promisedSetState = (newState) =>
      new Promise((resolve) => this.setState(newState, resolve));
    //get latest edge-ml fw version
    const latestEdgeMLVersion = await getLatestEdgeMLVersionNumber();
    await promisedSetState({ latestEdgeMLVersion: latestEdgeMLVersion });
    //check for available services on device
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

    if (hasDeviceInfo && hasSensorService && hasDFUFunction) {
      await promisedSetState({ isEdgeMLInstalled: true, hasDFUFunction: true });
    } else if (hasDFUFunction) {
      await promisedSetState({
        hasDFUFunction: true,
        isEdgeMLInstalled: false,
      });
    } else if (hasDeviceInfo && hasSensorService) {
      await promisedSetState({ isEdgeMLInstalled: true });
    } else {
      await promisedSetState({ deviceNotUsable: true });
    }
    return bleDevice;
  }

  connect() {
    return this.getDeviceInfo()
      .then(this.checkServicesAndGetLatestFWVersion)
      .then((bleDevice) => {
        if (this.state.isEdgeMLInstalled) {
          this.connectDevice(bleDevice)
            .then(this.getSensorCharacteristics)
            .then(this.onConnection);
        } else {
          //handle possibility of flashing firmware or show incompatibility of device
          this.setState({ connectedBLEDevice: bleDevice });
        }
      })
      .catch((err) => {
        console.log(err);
        ga_connectBluetooth(this.state.connectedDeviceData, err, false);
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

  toggleDFUModal() {
    this.setState({ showDFUModal: !this.state.showDFUModal });
  }

  handleLabelingSelect(labeling) {
    this.setState({ selectedLabeling: labeling });
  }

  handleLabelSelect(label) {
    this.setState({ selectedLabel: label });
  }

  toggleLabelingActive() {
    const timestamp = Date.now();
    console.log(this.labelingData)
    if (!this.state.selectedLabel) {
      return; 
    }
    if (!this.state.labelingStart) { // initial state
      this.labelingData.current = [{ 
        start: timestamp, 
        labelType: this.state.selectedLabel._id,
        labelingId: this.state.selectedLabeling._id
      }];
      this.setState({ labelingStart: timestamp, activeLabel: this.state.selectedLabel });
    } else if (!this.state.labelingEnd) { // when the end of the label is set
      const currentLabelingData = this.labelingData.current[this.labelingData.current.length - 1];
      currentLabelingData.end = timestamp;
      this.setState(prevState => ({ 
        labelingEnd: timestamp,
      }));
    } else { // new label start, clear labelEnd from previous label
      this.labelingData.current.push({ 
        start: timestamp, 
        labelType: this.state.selectedLabel._id, 
        labelingId: this.state.selectedLabeling._id 
      });
      this.setState(prevState => ({ 
        labelingStart: timestamp, 
        labelingEnd: undefined,
        activeLabel: this.state.selectedLabel,
        labelingPlotId: prevState.labelingPlotId + 1  
      }));
    }
  }

  handleKeyDown(e) {
    if (this.state.recorderState !== 'recording') {
      return;
    }
    console.log(e.key)
    if (e.key === '+' && this.state.selectedLabel) {
      this.toggleLabelingActive();
    } else if (e.key === '+' && !this.state.selectedLabel) {
      console.log('no label selected');
    } 
  }

  async fetchLabelings() {
    const res = await subscribeLabelingsAndLabels();
    this.setState({ labelings: res })
  }

  componentDidMount() {
    this.componentRef.current.focus();
    this.fetchLabelings();
  }

  componentDidUpdate() {
    if (this.state.recorderState === 'recording') {
      this.componentRef.current.focus();
    }
  }

  render() {
    if (!this.state.bleStatus) {
      return <BleNotActivated></BleNotActivated>;
    }

    return (
      <div 
        className="bleActivatedContainer" 
        ref={this.componentRef} 
        onKeyDown={this.handleKeyDown} 
        tabIndex="0" 
        style={{ outline: 'none' }}
      >
        <div className="mb-3">
          <BlePanelConnectDevice
            bleConnectionChanging={this.state.bleConnectionChanging}
            toggleBLEDeviceConnection={this.toggleBLEDeviceConnection}
            connectedBLEDevice={this.state.connectedBLEDevice}
            hasDFUFunction={this.state.hasDFUFunction}
            toggleDFUModal={this.toggleDFUModal}
            deviceNotUsable={this.state.deviceNotUsable}
            latestEdgeMLVersion={this.state.latestEdgeMLVersion}
            isEdgeMLInstalled={
              this.state.connectedDeviceData
                ? this.state.connectedDeviceData.installedFWVersion
                : undefined
            }
            outdatedVersionInstalled={this.state.outdatedVersionInstalled}
            connectedDeviceData={this.state.connectedDeviceData}
          ></BlePanelConnectDevice>
        </div>
        {this.state.showDFUModal ? (
          <DFUModal
            connectedBLEDevice={this.state.connectedBLEDevice}
            isEdgeMLInstalled={this.state.isEdgeMLInstalled}
            connectedDeviceData={this.state.connectedDeviceData}
            toggleDFUModal={this.toggleDFUModal}
            showDFUModal={this.state.showDFUModal}
            latestEdgeMLVersion={this.state.latestEdgeMLVersion}
            onDisconnection={this.onDisconnection}
          />
        ) : null}
        {this.state.deviceSensors &&
        this.state.connectedBLEDevice &&
        this.state.isEdgeMLInstalled ? (
          <Row>
            <Col>
              <div className="shadow mb-5 bg-white rounded">
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
              <BleLabelingMenu 
                labelings={this.state.labelings}
                selectedLabeling={this.state.selectedLabeling}
                selectedLabel={this.state.selectedLabel}
                handleSelectLabeling={this.handleLabelingSelect}
                handleSelectLabel={this.handleLabelSelect}
              />
              {this.state.recorderState === 'recording' && this.state.stream ? (
                  <BlePanelRecordingDisplay
                    deviceSensors={this.state.deviceSensors}
                    selectedSensors={this.state.selectedSensors}
                    lastData={this.currentData}
                    sensorKeys={this.sensorKeys}
                    fullSampleRate={this.state.fullSampleRate}
                    handleKeyDown={this.handleKeyDown}
                    labelingStart={this.state.labelingStart}
                    labelingEnd={this.state.labelingEnd}
                    labelingPlotId={this.state.labelingPlotId}
                    activeLabel={this.state.activeLabel}
                  ></BlePanelRecordingDisplay>
              ) : null}
            </Col>
          </Row>
        ) : null}
      </div>
    );
  }
}

export default UploadBLE;
