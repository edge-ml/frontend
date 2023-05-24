import { useEffect, useState } from 'react';
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
} from 'reactstrap';
import {
  getDeployDevices,
  deployModel,
} from '../../services/ApiServices/MlService';

import './index.css';
import { HyperparameterView } from '../../components/Hyperparameters/HyperparameterView';
import {
  EdgeMLTable,
  EdgeMLTableEntry,
  EdgeMLTableHeader,
} from '../../components/Common/EdgeMLTable';
import DFUManager from '../../components/BLE/DFUModal/DFU';

const DeployModal = ({ model, onClose }) => {
  const [devices, setDevices] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(undefined);
  const [deviceDropDownOpen, setDeviceDropDownOpen] = useState(false);
  const [selectedSensors, setSelectedSensors] = useState(undefined);
  const [compiledModel, setComiledModel] = useState(undefined);
  const [page, setPage] = useState(0);

  const dfuManager = new DFUManager();

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

  const toggleDeviceDropDown = () => setDeviceDropDownOpen(!deviceDropDownOpen);

  const selectSensor = (ts_idx, sensor_idx, component_idx) => {
    selectedSensors[ts_idx] = {
      sensor_id: sensor_idx,
      component_id: component_idx,
    };
    console.log(selectedSensors);
    setSelectedSensors([...selectedSensors]);
  };

  const onDeploy = async () => {
    setPage(1);
    const res = await deployModel(
      model._id,
      selectedSensors,
      parameters,
      selectedDevice
    );
    setComiledModel(res);
  };

  const connectBLE = () => {
    dfuManager.connectDevice();
  };

  const flashFirmware = () => {
    dfuManager.flashFirmware();
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

  return (
    <Modal isOpen={model} size="xl">
      <ModalHeader>Deploy model: {model.name}</ModalHeader>
      <ModalBody>
        {page === 0 ? (
          <div>
            <Dropdown isOpen={deviceDropDownOpen} toggle={toggleDeviceDropDown}>
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
            <div className="d-flex">
              <EdgeMLTable className="m-2" style={{ width: '500px' }}>
                <EdgeMLTableHeader>
                  <div className="d-flex justify-content-center w-100">
                    Configure TimeSeries
                  </div>
                </EdgeMLTableHeader>

                {model.timeSeries.map((elm, ts_idx) => (
                  <EdgeMLTableEntry>
                    <div className="d-flex align-items-center justify-content-between mx-2">
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
                              ].components[selectedSensors[ts_idx].component_id]
                                .name
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
                  </EdgeMLTableEntry>
                ))}
              </EdgeMLTable>
              <EdgeMLTable className="m-2" style={{ width: '400px' }}>
                <EdgeMLTableHeader>
                  <div className="d-flex justify-content-center w-100">
                    <div>Use BLE</div>
                    <FormGroup style={{ margin: 0 }}>
                      <CustomInput
                        className="ml-2"
                        inline
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
                    <Input></Input>
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
                    <Input></Input>
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
            <div className="w-100 d-flex justify-content-end">
              <Button onClick={onDeploy}>Deploy</Button>
            </div>
          </div>
        ) : (
          <div className="w-100 h-100">
            {compiledModel ? (
              <div>Flash BLE</div>
            ) : (
              <div>Compiling your model</div>
            )}
          </div>
        )}
        <div>
          <Button className="m-2" onClick={connectBLE}>
            Connect device
          </Button>
          <Button className="m-2" onClick={flashFirmware}>
            Flash firmware
          </Button>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose}>Close</Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeployModal;
