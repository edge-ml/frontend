import React, { useEffect, useState, useMemo } from "react";
import { Modal, Button, Menu, Progress, Loader } from "@mantine/core";
import {
  getDeployDevices,
  deployModel,
  downloadFirmware,
} from "../../services/ApiServices/MlService";

import "./index.css";
import { HyperparameterView } from "../../components/Hyperparameters/HyperparameterView";
import DFUManager from "../../components/BLE/DFUModal/DFU";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import DeployFeatures from "./Models/DeployFeatures";
import { downloadBlob } from "../../services/helpers";

const DeployModal = ({ isOpen, model, onClose }) => {
  const [devices, setDevices] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(undefined);
  const [deviceDropDownOpen, setDeviceDropDownOpen] = useState(false);
  const [selectedSensors, setSelectedSensors] = useState(undefined);
  const [compiledModel, setComiledModel] = useState(undefined);
  const [page, setPage] = useState(0);
  const [flashState, setFlashState] = useState("start");
  const [flashError, setFlashError] = useState(undefined);
  const [flashProgress, setFlashProgress] = useState(0);
  const [connectedDevice, setConnectedDevice] = useState(undefined);
  const [showSelectAllSensorWarning, setShowSelectAllSensorWarning] =
    useState(false);

  const [deployFeatures, setDeployFeatures] = useState({});

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
      if (connectedDevice) {
        dfuManager.disconnectDevice(connectedDevice);
      }
    };
  }, []);

  const resetFlashState = () => {
    setConnectedDevice(undefined);
    setFlashState("start");
    setFlashProgress(0);
  };

  const onClickSelectDevice = (device) => {
    setSelectedDevice(device);
  };

  const toggleDeviceDropDown = () => setDeviceDropDownOpen(!deviceDropDownOpen);

  const selectSensor = (ts_idx, sensor_idx, component_idx) => {
    selectedSensors[ts_idx] = {
      sensor_id: sensor_idx,
      component_id: component_idx,
    };

    setSelectedSensors([...selectedSensors]);
    if (checkAllSensorsSelected()) {
      setShowSelectAllSensorWarning(false);
    }
  };

  const checkAllSensorsSelected = () => {
    return selectedSensors.every((sensor) => {
      return (
        sensor["sensor_id"] !== undefined ||
        sensor["component_id"] !== undefined
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

  const checkAndDownloadFirmware = () => {
    if (checkAllSensorsSelected()) {
      onDownloadFirmware();
    } else {
      setShowSelectAllSensorWarning(true);
    }
  };

  const onGoBack = () => {
    setPage(0);
  };

  const onDeploy = async () => {
    setFlashState("modelDownload");

    const res = await deployModel(
      model._id,
      selectedSensors,
      parameters,
      selectedDevice,
      deployFeatures
    );

    setComiledModel(res);
  };

  const connectBLE = () => {
    dfuManager.connectDevice();
  };

  const disconnectBLE = () => {
    dfuManager.disconnectDevice(connectedDevice);
  };

  const onDownloadFirmware = async () => {
    const res = await downloadFirmware(
      model._id,
      selectedSensors,
      parameters,
      selectedDevice,
      deployFeatures
    );

    const blob = new Blob([res]);
    await downloadBlob(blob, `${model.name}.zip`);
  };

  const handleHyperparameterChange = ({ parameter_name, state }) => {
    const idx = parameters.findIndex(
      (elm) => elm.parameter_name === parameter_name
    );
    parameters[idx].value = state;
    setParameters([...parameters]);
  };

  if (!model || !selectedDevice || !selectedSensors || !parameters) {
    return null;
  }

  const inProgress = () => {
    return flashState === "modelDownload" || flashState === "uploading";
  };

  const renderDeployPart = () => {
    return (
      <div>
        {selectedDevice.ota_update ? (
          <>
            <div>
              {"Connected device: "}
              {connectedDevice ? (
                <b>{connectedDevice.name}</b>
              ) : (
                "No device connected"
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <div>{renderProgressInfo()}</div>
              {inProgress() ? (
                <div>
                  <Loader size="sm" color="dark" />
                </div>
              ) : null}
            </div>
          </>
        ) : (
          "Device does not support OTA updates. Download the Arduino firmware instead."
        )}
        <div>
          {selectedDevice.ota_update ? (
            <>
              <Button
                variant="outline"
                disabled={inProgress()}
                style={{ margin: "0.5rem" }}
                color={connectedDevice ? "red" : "blue"}
                onClick={connectedDevice ? disconnectBLE : connectBLE}
              >
                {connectedDevice ? "Disconnect device" : "Connect device"}
              </Button>
              <Button
                color="blue"
                variant="outline"
                disabled={connectedDevice === undefined || inProgress()}
                style={{ margin: "0.5rem" }}
                onClick={onDeploy}
              >
                Flash firmware
              </Button>
            </>
          ) : null}
          <Button
            color="blue"
            variant="outline"
            disabled={inProgress()}
            style={{ margin: "0.5rem" }}
            onClick={onDownloadFirmware}
          >
            Download firmware
          </Button>
        </div>
        {inProgress() ? (
          <div style={{ color: "red" }}>
            Please do not leave this page or disconnect the device, while the
            flashing is in progress.
          </div>
        ) : null}
        {selectedDevice.ota_update ? (
          <div style={{ marginTop: "1rem" }}>
            <Progress
              color={flashState === "uploadFinished" ? "blue" : "green"}
              value={flashProgress}
            />
          </div>
        ) : null}
      </div>
    );
  };

  const renderProgressInfo = () => {
    switch (flashState) {
      case "start":
        return "Connect device for flashing";
      case "connected":
        return "Device is connected. Press Flash firmware to begin flashing process.";
      case "modelDownload":
        return "Compiling and downloading model...";
      case "uploading":
        return "Flashing model onto device...";
      case "finished":
        return "Firmware successfully flashed onto device";
      default:
        return "error";
    }
  };

  return (
    <Modal isOpen={isOpen} size="xl">
      <Modal.Header>
        <Modal.Title>Generate firmware: {model.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {page === 0 ? (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              <h5 style={{ fontWeight: 700, margin: 0, marginRight: "0.5rem" }}>
                1. Select Device:{" "}
              </h5>
              <Menu>
                <Menu.Target>
                  <Button variant="outline" color="blue" size="lg">
                    {selectedDevice.name}
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  {devices.map((device, idx) => (
                    <Menu.Item
                      key={"devicekey" + idx}
                      onClick={() => onClickSelectDevice(device)}
                    >
                      {device.name}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            </div>
            <hr></hr>
            <h5 style={{ fontWeight: 700 }}>2. Configure Device:</h5>
            <div style={{ display: "flex" }}>
              <div style={{ margin: "1rem 1rem 1rem 0.5rem", width: "500px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignContent: "center",
                  }}
                >
                  <b>Configure TimeSeries</b>
                </div>
                <div className="body-wrapper-overflow">
                  {model.timeSeries.map((elm, ts_idx) => (
                    <div
                      key={"tskey" + ts_idx}
                      className="datasetCard"
                      style={{
                        padding: "0.5rem",
                        background:
                          ts_idx % 2 === 1 ? "rgb(249, 251, 252)" : "",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <strong style={{ paddingLeft: "0.5rem" }}>{elm}</strong>
                        <Menu>
                          <Menu.Target>
                            <Button variant="outline" color="blue" size="sm">
                              {selectedSensors[ts_idx].sensor_id !== undefined
                                ? selectedDevice.sensors[
                                    selectedSensors[ts_idx].sensor_id
                                  ].name +
                                  "_" +
                                  selectedDevice.sensors[
                                    selectedSensors[ts_idx].sensor_id
                                  ].components[
                                    selectedSensors[ts_idx].component_id
                                  ].name
                                : "Unset"}
                            </Button>
                          </Menu.Target>
                          <Menu.Dropdown>
                            {selectedDevice.sensors.map((sensor, sensor_idx) =>
                              sensor.components.map(
                                (component, component_idx) => (
                                  <Menu.Item
                                    key={`${sensor_idx}_${component_idx}`}
                                    onClick={() =>
                                      selectSensor(
                                        ts_idx,
                                        sensor_idx,
                                        component_idx
                                      )
                                    }
                                  >
                                    {sensor.name + "_" + component.name}
                                  </Menu.Item>
                                )
                              )
                            )}
                          </Menu.Dropdown>
                        </Menu>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <DeployFeatures
                onUpdateDeployFeautures={(data) => setDeployFeatures(data)}
                featureNames={selectedDevice.deploy_features}
              ></DeployFeatures>
            </div>
            <hr></hr>
            <div style={{ margin: "0.5rem" }}>
              <h5 style={{ fontWeight: 700 }}>3. Additional Settings:</h5>
              <HyperparameterView
                hyperparameters={parameters}
                isAdvanced={false}
                handleHyperparameterChange={handleHyperparameterChange}
              ></HyperparameterView>
            </div>
            {flashError ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  marginLeft: "0.5rem",
                }}
              >
                <div>
                  <FontAwesomeIcon icon={faCircleExclamation} color="red" />
                </div>
                <div style={{ color: "red" }}>
                  An error occured while flashing the model onto the device.
                </div>
              </div>
            ) : null}
            <div
              style={{ width: "100%", display: "flex", flexDirection: "row" }}
            >
              <div style={{ color: "red", flexGrow: 1 }}>
                {showSelectAllSensorWarning
                  ? "Please configure all time series under configure time series before deploying."
                  : ""}
              </div>
              <div>
                <Button
                  variant="outline"
                  color="blue"
                  onClick={checkAndDownloadFirmware}
                >
                  Download firmware
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ width: "100%", height: "100%" }}>
            {renderDeployPart()}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {page == 1 ? (
          <Button variant="outline" color="blue" onClick={onGoBack}>
            Back
          </Button>
        ) : null}
        <Button onClick={onClose} variant="outline" color="red">
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeployModal;
