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
} from 'reactstrap';
import {
  getDeployDevices,
  deployModel,
} from '../../services/ApiServices/MlService';

import './index.css';
import { HyperparameterView } from '../../components/Hyperparameters/HyperparameterView';

const DeployModal = ({ model, onClose }) => {
  const [devices, setDevices] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(undefined);
  const [deviceDropDownOpen, setDeviceDropDownOpen] = useState(false);
  const [selectedSensors, setSelectedSensors] = useState(undefined);

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

  const onDeploy = () => {
    deployModel(model._id, selectedSensors, parameters, selectedDevice);
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
        <div>
          <h5>Configure TimeSeries</h5>
          <div className="p-2">
            {model.timeSeries.map((elm, ts_idx) => (
              <div className="d-flex align-items-center">
                <div className="mr-3 pr-3">{elm}</div>
                <UncontrolledDropdown style={{ position: 'relative' }}>
                  <DropdownToggle caret size="sm">
                    {selectedSensors[ts_idx].sensor_id !== undefined
                      ? selectedDevice.sensors[
                          selectedSensors[ts_idx].sensor_id
                        ].name +
                        '_' +
                        selectedDevice.sensors[
                          selectedSensors[ts_idx].sensor_id
                        ].components[selectedSensors[ts_idx].component_id].name
                      : 'Unset'}
                  </DropdownToggle>
                  <DropdownMenu>
                    {selectedDevice.sensors.map((sensor, sensor_idx) =>
                      sensor.components.map((component, component_idx) => (
                        <DropdownItem
                          onClick={() =>
                            selectSensor(ts_idx, sensor_idx, component_idx)
                          }
                        >
                          {sensor.name + '_' + component.name}
                        </DropdownItem>
                      ))
                    )}
                  </DropdownMenu>
                </UncontrolledDropdown>
              </div>
            ))}
          </div>
          <div>
            {console.log(parameters)}
            <HyperparameterView
              hyperparameters={parameters}
              isAdvanced={false}
              handleHyperparameterChange={handleHyperparameterChange}
            ></HyperparameterView>
          </div>
        </div>
        <Button onClick={onDeploy}>Deploy</Button>
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose}>Close</Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeployModal;
