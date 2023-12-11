import { useEffect, useState, useMemo } from 'react';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  UncontrolledDropdown,
  FormGroup,
  CustomInput,
  Progress,
  Spinner,
} from 'reactstrap';
import {
  getDeployDevices,
  deployModel,
  downloadFirmware,
} from '../../../services/ApiServices/MlService';

// import './index.css';
import { HyperparameterView } from '../../../../components/Hyperparameters/HyperparameterView';
import {
  EdgeMLTable,
  EdgeMLTableEntry,
  EdgeMLTableHeader,
} from '../../../../components/Common/EdgeMLTable';
import DFUManager from '../../../../components/BLE/DFUModal/DFU';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';

const DeployModal = ({ model, onClose }) => {
  const [devices, setDevices] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [additionalSettings, setAdditionalSettings] = useState({
    ble: {
      serviceUUID: '6E400001-B5A3-F393-E0A9-E50E24DCCA9E',
      characteristicUUID: '3c6e98a5-f027-49aa-8b2e-c7b3f8a9c18c',
    },
  });
  const [useBLE, setUseBLE] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(undefined);
  const [deviceDropDownOpen, setDeviceDropDownOpen] = useState(false);
  const [selectedSensors, setSelectedSensors] = useState(undefined);
  const [compiledModel, setComiledModel] = useState(undefined);
  const [page, setPage] = useState(0);
  const [flashState, setFlashState] = useState('start'); //start, connected, modelDownload, uploading, finished
  const [flashError, setFlashError] = useState(undefined);
  const [flashProgress, setFlashProgress] = useState(0);
  const [connectedDevice, setConnectedDevice] = useState(undefined);
  const [showSelectAllSensorWarning, setShowSelectAllSensorWarning] =
    useState(false);

  const dfuManager = useMemo(
    () =>
      new DFUManager(
        setFlashState,
        setFlashError,
        setFlashProgress,
        setConnectedDevice
      ),
    []
  );

  useEffect(() => {
    if (flashError) {
      resetFlashState();
      onGoBack();
    }
    return () => {};
  }, [flashError]);

  useEffect(() => {
    if (!model) return;
    getDeployDevices(model._id).then((config) => {
      setDevices(config.devices);
      setSelectedDevice(config.devices[0]);
      setParameters(config.parameters);
      var sensorArr = Array.from({ length: model.timeSeries.length });
      sensorArr = sensorArr.map((elm) => {
        return { sensor_id: undefined, component_id: undefined };
      });
      setSelectedSensors(sensorArr);
    });
  }, [model]);

  useEffect(() => {
    if (
      compiledModel !== undefined &&
      compiledModel !== null &&
      connectedDevice !== undefined
    ) {
      dfuManager.flashFirmware(compiledModel);
    }
  }, [compiledModel]);

  useEffect(() => {
    return () => {
      // Component will unmount
      if (connectedDevice) {
        dfuManager.disconnectDevice(connectedDevice);
      }
    };
  }, []);

  const resetFlashState = () => {
    setConnectedDevice(undefined);
    setFlashState('start');
    setFlashProgress(0);
  };

  const toggleDeviceDropDown = () => setDeviceDropDownOpen(!deviceDropDownOpen);

  const selectSensor = (ts_idx, sensor_idx, component_idx) => {
    selectedSensors[ts_idx] = {
      sensor_id: sensor_idx,
      component_id: component_idx,
    };
    console.log(selectedSensors);
    setSelectedSensors([...selectedSensors]);
    if (checkAllSensorsSelected()) {
      setShowSelectAllSensorWarning(false);
    }
  };

  const checkAllSensorsSelected = () => {
    return selectedSensors.every((sensor) => {
      return (
        sensor['sensor_id'] !== undefined ||
        sensor['component_id'] !== undefined
      );
    });
  };

  const onSwitchPage = () => {
    if (checkAllSensorsSelected()) {
      setPage(1);
    } else {
      setShowSelectAllSensorWarning(true);
    }
  };

  const onGoBack = () => {
    setPage(0);
  };

  const onDeploy = async () => {
    setFlashState('modelDownload');

    const a_settings = {};
    a_settings['ble'] = useBLE ? additionalSettings['ble'] : undefined;

    const res = await deployModel(
      model._id,
      selectedSensors,
      parameters,
      selectedDevice,
      a_settings
    );
    /**const buffer = new ArrayBuffer(10000);
    const view = new Uint8Array(buffer);

    view.fill(0); // Fill the ArrayBuffer with zeroes */
    console.log('Compiled model length: ', res.length);
    setComiledModel(res);
  };

  const connectBLE = () => {
    dfuManager.connectDevice();
  };

  const disconnectBLE = () => {
    dfuManager.disconnectDevice(connectedDevice);
  };

  const onDownloadFirmware = async () => {
    const a_settings = {};
    a_settings['ble'] = useBLE ? additionalSettings['ble'] : undefined;

    const res = await downloadFirmware(
      model._id,
      selectedSensors,
      parameters,
      selectedDevice,
      a_settings
    );
    console.log(res);
    const downloadLink = document.createElement('a');
    const blob = new Blob([res]);
    const objectUrl = URL.createObjectURL(blob);
    downloadLink.href = objectUrl;
    downloadLink.download = `${model.name}.zip`;
    downloadLink.click();
    URL.revokeObjectURL(objectUrl);
  };

  const handleHyperparameterChange = ({ parameter_name, state }) => {
    console.log(parameter_name, state);
    const idx = parameters.findIndex(
      (elm) => elm.parameter_name === parameter_name
    );
    parameters[idx].value = state;
    setParameters([...parameters]);
  };
  console.log(parameters);
  if (!model || !selectedDevice || !selectedSensors || !parameters) {
    return null;
  }

  const inProgress = () => {
    return flashState === 'modelDownload' || flashState === 'uploading';
  };

  console.log(selectedDevice);

  const renderDeployPart = () => {
    return (
      <div>
        {selectedDevice.ota_update ? (
          <>
            <div>
              {'Connected device: '}
              {connectedDevice ? (
                <b>{connectedDevice.name}</b>
              ) : (
                'No device connected'
              )}
            </div>
            <div className="d-flex flex-row">
              <div>{renderProgressInfo()}</div>
              {inProgress() ? (
                <div>
                  <Spinner color="dark" size="sm" />
                </div>
              ) : null}
            </div>
          </>
        ) : (
          'Device does not support OTA updates. Download the Arduino firmware instead.'
        )}
        <div>
          {selectedDevice.ota_update ? (
            <>
              <Button
                outline
                disabled={inProgress()}
                className="m-2"
                color={connectedDevice ? 'danger' : 'primary'}
                onClick={connectedDevice ? disconnectBLE : connectBLE}
              >
                {connectedDevice ? 'Disconnect device' : 'Connect device'}
              </Button>
              <Button
                color="primary"
                outline
                disabled={connectedDevice === undefined || inProgress()}
                className="m-2"
                onClick={onDeploy}
              >
                Flash firmware
              </Button>
            </>
          ) : null}
          <Button
            color="primary"
            outline
            disabled={inProgress()}
            className="m-2"
            onClick={onDownloadFirmware}
          >
            Download firmware
          </Button>
        </div>
        {inProgress() ? (
          <div className="text-danger">
            Please do not leave this page or disconnect the device, while the
            flashing is in progress.
          </div>
        ) : null}
        {selectedDevice.ota_update ? (
          <div className="mt-3">
            <Progress
              color={flashState === 'uploadFinished' ? 'primary' : 'success'}
              value={flashProgress}
            />
          </div>
        ) : null}
      </div>
    );
  };

  const renderProgressInfo = () => {
    switch (flashState) {
      case 'start':
        return 'Connect device for flashing';
      case 'connected':
        return 'Device is connected. Press Flash firmware to begin flashing process.';
      case 'modelDownload':
        return 'Compiling and downloading model...';
      case 'uploading':
        return 'Flashing model onto device...';
      case 'finished':
        return 'Firmware successfully flashed onto device';
      default:
        return 'error';
    }
  };

  return (
    <Modal isOpen={model} size="xl">
      <ModalHeader>Deploy model: {model.name}</ModalHeader>
      <ModalBody>
        {page === 0 ? (
          <div>
            <div className="d-flex justify-content-center">
              <Dropdown
                isOpen={deviceDropDownOpen}
                toggle={toggleDeviceDropDown}
              >
                <DropdownToggle caret size="lg">
                  {selectedDevice.name}
                </DropdownToggle>
                <DropdownMenu>
                  {devices.map((device, idx) => (
                    <DropdownItem onClick={() => setSelectedDevice(device)}>
                      {device.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>
            <div className="d-flex">
              <div className="my-4 ml-2 mr-4" style={{ width: '500px' }}>
                <div className="header-wrapper d-flex justify-content-center align-content-center">
                  <b>Configure TimeSeries</b>
                </div>
                <div className="body-wrapper-overflow">
                  {model.timeSeries.map((elm, ts_idx) => (
                    <div
                      className="datasetCard"
                      style={{
                        background:
                          ts_idx % 2 === 1 ? 'rgb(249, 251, 252)' : '',
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <strong className="pl-2">{elm}</strong>
                        <UncontrolledDropdown
                          direction="left"
                          style={{ position: 'relative' }}
                        >
                          <DropdownToggle caret size="sm">
                            {selectedSensors[ts_idx].sensor_id !== undefined
                              ? selectedDevice.sensors[
                                  selectedSensors[ts_idx].sensor_id
                                ].name +
                                '_' +
                                selectedDevice.sensors[
                                  selectedSensors[ts_idx].sensor_id
                                ].components[
                                  selectedSensors[ts_idx].component_id
                                ].name
                              : 'Unset'}
                          </DropdownToggle>
                          <DropdownMenu>
                            {selectedDevice.sensors.map((sensor, sensor_idx) =>
                              sensor.components.map(
                                (component, component_idx) => (
                                  <DropdownItem
                                    onClick={() =>
                                      selectSensor(
                                        ts_idx,
                                        sensor_idx,
                                        component_idx
                                      )
                                    }
                                  >
                                    {sensor.name + '_' + component.name}
                                  </DropdownItem>
                                )
                              )
                            )}
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <EdgeMLTable className="m-2" style={{ width: '400px' }}>
                <EdgeMLTableHeader>
                  <div className="d-flex justify-content-center w-100">
                    <div>Use BLE</div>
                    <FormGroup style={{ margin: 0 }}>
                      <CustomInput
                        className="ml-2"
                        inline
                        onChange={(e) => setUseBLE(!useBLE)}
                        type="switch"
                        id="exampleCustomSwitch"
                        // checked={this.props.project.enableDeviceApi}
                        // onChange={(e) => this.props.onDeviceApiSwitch(e.target.checked)}
                      />
                    </FormGroup>
                  </div>
                </EdgeMLTableHeader>
                <EdgeMLTableEntry>
                  <div className="d-flex p-2 align-items-center">
                    <div
                      className="font-weight-bold"
                      style={{ width: '200px' }}
                    >
                      Service-UUID
                    </div>
                    <Input
                      disabled={!useBLE}
                      value={additionalSettings.ble.serviceUUID}
                    ></Input>
                  </div>
                </EdgeMLTableEntry>
                <EdgeMLTableEntry>
                  <div className="d-flex p-2 algin-items-center">
                    <div
                      className="font-weight-bold"
                      style={{ width: '200px' }}
                    >
                      Characteristic-UUID
                    </div>
                    <Input
                      disabled={!useBLE}
                      value={additionalSettings.ble.characteristicUUID}
                    ></Input>
                  </div>
                </EdgeMLTableEntry>
              </EdgeMLTable>
            </div>
            <div className="m-2">
              <div className="font-weight-bold fs-medium">Settings</div>
              <HyperparameterView
                hyperparameters={parameters}
                isAdvanced={false}
                handleHyperparameterChange={handleHyperparameterChange}
              ></HyperparameterView>
            </div>
            {flashError ? (
              <div className="d-flex flex-row ml-2">
                <div>
                  <FontAwesomeIcon icon={faCircleExclamation} color="red" />
                </div>
                <div className="text-danger">
                  An error occured while flashing the model onto the device.
                </div>
              </div>
            ) : null}
            <div className="w-100 d-flex flex-row">
              <div className="text-danger flex-grow-1">
                {showSelectAllSensorWarning
                  ? 'Please configure all time series under configure time series before deploying.'
                  : ''}
              </div>
              <div>
                <Button outline color="primary" onClick={onSwitchPage}>
                  Deploy
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-100 h-100">{renderDeployPart()}</div>
        )}
      </ModalBody>
      <ModalFooter>
        {page == 1 ? (
          <Button outline color="primary" onClick={onGoBack}>
            Back
          </Button>
        ) : null}
        <Button onClick={onClose} outline color="danger">
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeployModal;
