import React, { Component } from 'react';
import {
  Container,
  Col,
  Row,
  Table,
  Input,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  InputGroup,
  Spinner,
  InputGroupAddon,
  InputGroupText
} from 'reactstrap';
import BleNotActivated from '../components/BLE/BleNotActivated';
import Loader from '../modules/loader';
import { createDataset } from '../services/ApiServices/DatasetServices';

import {
  getDevices,
  getDeviceById
} from '../services/ApiServices/DeviceService';

class UploadBLE extends Component {
  constructor(props) {
    super(props);
    this.state = {
      connectedBLEDevice: undefined,
      bleStatus: this.isWebBluetoothEnabled(),
      sensorMap: new Map(),
      sampleRate: 50,
      datasetName: '',
      recording: false,
      devices: undefined,
      deviceInfo: undefined,
      recordReady: true
    };
    this.connectBLEDevice = this.connectBLEDevice.bind(this);
    this.isWebBluetoothEnabled = this.isWebBluetoothEnabled.bind(this);
    this.connectDevice = this.connectDevice.bind(this);
    this.receiveSensorData = this.receiveSensorData.bind(this);
    this.connect = this.connect.bind(this);
    this.onDisconnection = this.onDisconnection.bind(this);
    this.getDeviceInfo = this.getDeviceInfo.bind(this);
    this.parseData = this.parseData.bind(this);
    this.getSensorCharacteristics = this.getSensorCharacteristics.bind(this);
    this.onStartRecording = this.onStartRecording.bind(this);
    this.configureSingleSensor = this.configureSingleSensor.bind(this);
    this.onLatencyChanged = this.onLatencyChanged.bind(this);
    this.onSampleRateChanged = this.onSampleRateChanged.bind(this);
    this.onToggleSensor = this.onToggleSensor.bind(this);
    this.floatToBytes = this.floatToBytes.bind(this);
    this.intToBytes = this.intToBytes.bind(this);
    this.onGlobalSampleRateChanged = this.onGlobalSampleRateChanged.bind(this);
    this.onDatasetNameChanged = this.onDatasetNameChanged.bind(this);
    this.findSensorByKey = this.findSensorByKey.bind(this);
    this.unSubscribeAllSensors = this.unSubscribeAllSensors.bind(this);

    this.recorderMap = undefined;
    this.recorderDataset = undefined;
    this.sensorService;
    this.recordInterval;
    this.bleDevice;
    this.bleServer;
    this.sensorTypes = undefined;
    this.parseScheme = undefined;
    this.sensorConfigCharacteristic;
    this.sensorDataCharacteristic;
    this.sensorServiceUuid = '34c2e3bb-34aa-11eb-adc1-0242ac120002';
    this.sensorConfigCharacteristicUuid =
      '34c2e3bd-34aa-11eb-adc1-0242ac120002';
    this.sensorDataCharacteristicUuid = '34c2e3bc-34aa-11eb-adc1-0242ac120002';
  }

  componentDidMount() {
    getDevices().then(data => {
      this.setState({
        devices: data
      });
    });
  }

  async unSubscribeAllSensors() {
    for (const sensor of this.state.deviceInfo.sensors) {
      await this.configureSingleSensor(sensor.bleKey, 0, 0);
    }
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

  async onStartRecording() {
    if (this.recordInterval) {
      this.setState({ recordReady: false });
      clearInterval(this.recordInterval);
      this.recordInterval = undefined;
      const globalStartTime = Math.min(
        ...this.recorderDataset.timeSeries.map(elm => elm.start)
      );
      const globalEndTime = Math.max(
        ...this.recorderDataset.timeSeries.map(elm => elm.end)
      );
      this.recorderDataset.start = globalStartTime;
      this.recorderDataset.end = globalEndTime;
      console.log(this.recorderDataset);
      createDataset(this.recorderDataset).then(() => {
        console.log('Uploaded dataset');
      });
      this.setState({
        recording: false
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
        elm => elm.id === sensor.type
      );
      sensorType.parseScheme.map(elm => {
        timeSeries.push({
          name: this.findSensorByKey(key).name + '_' + elm.name,
          start: new Date().getTime() + 10000000,
          end: new Date().getTime(),
          data: []
        });
      });
    });
    this.recorderDataset = {
      name: this.state.datasetName,
      start: new Date().getTime() + 10000000,
      end: new Date().getTime(),
      timeSeries: timeSeries
    };
    this.setState({ recordReady: true });
    this.recordInterval = setInterval(() => {
      this.state.sensorMap.forEach((value, key) => {
        const sensor = this.findSensorByKey(key);
        const sensorType = this.state.deviceInfo.scheme.find(
          elm => elm.id === sensor.type
        );
        sensorType.parseScheme.map((elm, idx) => {
          if (this.recorderMap.get(key)[idx]) {
            const searchString = sensor.name + '_' + elm.name;
            const timeSeriesData = this.recorderDataset.timeSeries.find(
              elm => elm.name === searchString
            );
            const addTime = new Date().getTime();
            timeSeriesData.data.push({
              datapoint: this.recorderMap.get(key)[idx],
              timestamp: addTime
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
  }

  async configureSingleSensor(sensorId, sampleRate, latency) {
    var configPacket = new Uint8Array(9);
    configPacket[0] = sensorId;
    configPacket.set(this.floatToBytes(sampleRate), 1);
    configPacket.set(this.intToBytes(latency), 5);
    await this.sensorConfigCharacteristic.writeValue(configPacket);
  }

  floatToBytes(value) {
    var tempArray = new Float32Array(1);
    tempArray[0] = value;
    return new Uint8Array(tempArray.buffer);
  }

  intToBytes(value) {
    var tempArray = new Int32Array(1);
    tempArray[0] = value;
    return new Uint8Array(tempArray.buffer);
  }

  receiveSensorData(value) {
    if (this.recorderMap) {
      // Get sensor data
      var sensor = value.getUint8(0);
      var size = value.getUint8(1);
      var parsedData = this.parseData(sensor, value);
      var parsedName = parsedData[0];
      var parsedValue = parsedData[1];
      var rawValues = parsedData[2];

      //console.log(sensor + ": " + rawValues + " at: " + new Date().getTime())
      this.recorderMap.set(sensor, rawValues);
    }
  }

  parseData(sensorKey, data) {
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
  }

  onDisconnection(event) {
    this.setState({
      connectedBLEDevice: undefined
    });
  }

  onConnection() {
    console.log('Device is now connected');
  }

  getSensorCharacteristics() {
    console.log('Getting sensor characteristics');
    this.sensorService
      .getCharacteristic(this.sensorConfigCharacteristicUuid)
      .then(characteristic => {
        this.sensorConfigCharacteristic = characteristic;
      })
      .then(_ => {
        return this.sensorService.getCharacteristic(
          this.sensorDataCharacteristicUuid
        );
      })
      .then(characteristic => {
        this.sensorDataCharacteristic = characteristic;
        this.sensorDataCharacteristic.startNotifications();
        this.sensorDataCharacteristic.addEventListener(
          'characteristicvaluechanged',
          event => this.receiveSensorData(event.target.value)
        );
      });
  }

  isWebBluetoothEnabled() {
    if (!navigator.bluetooth) {
      console.log('Web Bluetooth is NOT available!');
      return false;
    }
    console.log('Web Bluetooth is available!');
    return true;
  }

  getDeviceInfo() {
    let options = {
      filters: [{ services: [this.sensorServiceUuid] }]
    };
    console.log('Requesting BLE device info...');
    return navigator.bluetooth
      .requestDevice(options)
      .then(device => {
        this.bleDevice = device;
      })
      .then(() => {
        return getDeviceById(
          this.state.devices.find(
            elm => this.bleDevice.name.toLowerCase() === elm.name.toLowerCase()
          )._id
        );
      })
      .then(deviceInfo => {
        this.setState({
          connectedBLEDevice: this.bleDevice,
          deviceInfo: deviceInfo
        });
      })
      .catch(error => {
        console.log('Request device error: ' + error);
        if (error.toString().includes('Bluetooth adapter not available')) {
          alert('Activate bluetooth');
        }
      });
  }

  connectDevice() {
    console.log('Connecting to device');
    this.bleDevice.addEventListener(
      'gattserverdisconnected',
      this.onDisconnection
    );
    return this.bleDevice.gatt
      .connect()
      .then(server => {
        this.bleServer = server;
        return this.bleServer.getPrimaryService(this.sensorServiceUuid);
      })
      .then(service => {
        console.log(service);
        this.sensorService = service;
      });
  }

  connect() {
    return this.getDeviceInfo()
      .then(this.connectDevice)
      .then(this.getSensorCharacteristics)
      .then(this.onConnection);
  }

  connectBLEDevice() {
    if (this.state.recording) {
      this.onStartRecording();
    }
    if (this.state.connectedBLEDevice) {
      this.state.connectedBLEDevice.gatt.disconnect();
      this.setState({
        connectedBLEDevice: undefined
      });
    } else {
      this.connect()
        .then(_ => {
          console.log('Connected');
        })
        .catch(error => {
          console.log('ERROR: ' + error);
        });
    }
  }

  findSensorByKey(key) {
    return this.state.deviceInfo.sensors.find(elm => elm.bleKey === key);
  }

  render() {
    if (!this.state.bleStatus) {
      return <BleNotActivated></BleNotActivated>;
    }
    const connected = this.state.connectedBLEDevice;
    return (
      <div style={{ margin: '8px' }}>
        <div className="shadow p-3 mb-5 bg-white rounded">
          <div style={{ fontSize: 'x-large' }}>1. Device</div>
          <div
            style={{
              borderBottom: '1px solid',
              marginTop: '8px',
              marginBottom: '8px',
              opacity: '0.2'
            }}
          ></div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              {connected ? (
                <div>
                  <b>{this.state.connectedBLEDevice.name}</b> (
                  {this.state.connectedBLEDevice.id})
                </div>
              ) : (
                'No device connected'
              )}
            </div>
            <Button
              color={connected ? 'danger' : 'primary'}
              onClick={this.connectBLEDevice}
            >
              {connected ? 'Disconnect device' : 'Connect device'}
            </Button>
          </div>
        </div>
        <div
          style={connected ? null : { opacity: '0.4', pointerEvents: 'none' }}
        >
          {this.state.deviceInfo ? (
            <Row>
              <Col>
                <div className="shadow p-3 mb-5 bg-white rounded">
                  <div
                    style={
                      this.state.recording
                        ? { opacity: '0.4', pointerEvents: 'none' }
                        : null
                    }
                  >
                    <div style={{ fontSize: 'x-large' }}>
                      2. Configure sensors
                    </div>
                    <div
                      style={{
                        borderBottom: '1px solid',
                        marginTop: '8px',
                        marginBottom: '8px',
                        opacity: '0.2'
                      }}
                    ></div>

                    <Table style={{ width: 'fit-content' }}>
                      <thead>
                        <tr className="bg-light">
                          <th>Select</th>
                          <th>SensorName</th>
                          <th>SensorType</th>
                          <th>Components</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.deviceInfo.sensors.map(
                          (sensor, sensorIndex) => {
                            const sensorData = sensor;
                            const sensorKey = sensor.bleKey;
                            const typeData = this.state.deviceInfo.scheme.find(
                              elm => elm.id === sensorData.type
                            );
                            return (
                              <tr key={sensor.bleKey}>
                                <td>
                                  {' '}
                                  <Input
                                    onChange={e =>
                                      this.onToggleSensor(sensorKey)
                                    }
                                    className="datasets-check"
                                    type="checkbox"
                                  />
                                </td>
                                <td>{sensorData.name}</td>
                                <td>{typeData.type}</td>
                                <td>
                                  {typeData.parseScheme
                                    .map(elm => elm.name)
                                    .join('; ')}
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </Table>
                  </div>
                </div>
              </Col>
              <Col>
                <div
                  style={
                    this.state.sensorMap.size > 0
                      ? null
                      : { opacity: '0.4', pointerEvents: 'none' }
                  }
                >
                  <div className="shadow p-3 mb-5 bg-white rounded">
                    <div style={{ fontSize: 'x-large' }}>3.Record dataset</div>
                    <div
                      style={{
                        borderBottom: '1px solid',
                        marginTop: '8px',
                        marginBottom: '8px',
                        opacity: '0.2'
                      }}
                    ></div>
                    <InputGroup>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>{'Dataset name'}</InputGroupText>
                      </InputGroupAddon>
                      <Input
                        id="bleDatasetName"
                        placeholder={'dataset name'}
                        onChange={this.onDatasetNameChanged}
                        value={this.state.datasetName}
                      />
                    </InputGroup>
                    <InputGroup>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>{'SampleRate'}</InputGroupText>
                      </InputGroupAddon>
                      <Input
                        id="bleSampleRate"
                        placeholder={'SampleRate'}
                        onChange={this.onGlobalSampleRateChanged}
                        value={this.state.sampleRate}
                      />
                    </InputGroup>
                    <Button
                      color={
                        this.state.recording && this.state.recordReady
                          ? 'danger'
                          : 'primary'
                      }
                      onClick={this.onStartRecording}
                      disabled={
                        !this.state.sampleRate || !this.state.datasetName
                      }
                    >
                      {this.state.recording ? (
                        this.state.recordReady ? (
                          'Stop recording'
                        ) : (
                          <div>
                            Loading...
                            <Spinner
                              style={{
                                width: '1rem',
                                height: '1rem',
                                marginLeft: '4px'
                              }}
                              color="primary"
                            />
                          </div>
                        )
                      ) : (
                        'Start recording'
                      )}
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          ) : null}
        </div>
      </div>
    );
  }
}

export default UploadBLE;
