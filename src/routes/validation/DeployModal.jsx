import React, { useEffect, useState, useMemo } from "react";
import {
  Modal,
  Button,
  Progress,
  Select,
  Group,
  Box,
  Text,
  Title,
  Divider,
  Loader,
} from "@mantine/core";
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

const DeployModal = ({ isOpen, model, onClose }) => {
  const [devices, setDevices] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(undefined);
  const [selectedSensors, setSelectedSensors] = useState(undefined);
  const [compiledModel, setComiledModel] = useState(undefined);
  const [page, setPage] = useState(0);
  const [flashState, setFlashState] = useState("start"); //start, connected, modelDownload, uploading, finished
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
    getDeployDevices(model.id).then((config) => {
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
    setFlashState("start");
    setFlashProgress(0);
  };

  const onClickSelectDevice = (device) => {
    setSelectedDevice(device);
  };

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

    // const a_settings = {};

    // a_settings['ble'] = useBLE ? additionalSettings['ble'] : undefined;

    const res = await deployModel(
      model.id,
      selectedSensors,
      parameters,
      selectedDevice,
      deployFeatures
    );
    /**const buffer = new ArrayBuffer(10000);
    const view = new Uint8Array(buffer);

    view.fill(0); // Fill the ArrayBuffer with zeroes */

    setComiledModel(res);
  };

  const connectBLE = () => {
    dfuManager.connectDevice();
  };

  const disconnectBLE = () => {
    dfuManager.disconnectDevice(connectedDevice);
  };

  const onDownloadFirmware = async () => {
    // const a_settings = {};
    // a_settings['ble'] = useBLE ? additionalSettings['ble'] : undefined;

    const res = await downloadFirmware(
      model.id,
      selectedSensors,
      parameters,
      selectedDevice,
      deployFeatures
    );

    const downloadLink = document.createElement("a");
    const blob = new Blob([res]);
    const objectUrl = URL.createObjectURL(blob);
    downloadLink.href = objectUrl;
    downloadLink.download = `${model.name}.zip`;
    downloadLink.click();
    URL.revokeObjectURL(objectUrl);
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
      <Box>
        {selectedDevice.ota_update ? (
          <>
            <Text>
              Connected device:{" "}
              {connectedDevice ? (
                <Text component="span" fw={700}>
                  {connectedDevice.name}
                </Text>
              ) : (
                "No device connected"
              )}
            </Text>
            <Group align="center" gap="sm" mt="xs">
              <Text>{renderProgressInfo()}</Text>
              {inProgress() ? (
                <Loader size="sm" />
              ) : null}
            </Group>
          </>
        ) : (
          "Device does not support OTA updates. Download the Arduino firmware instead."
        )}
        <Group mt="sm">
          {selectedDevice.ota_update ? (
            <>
              <Button
                variant="outline"
                disabled={inProgress()}
                color={connectedDevice ? "danger" : "primary"}
                onClick={connectedDevice ? disconnectBLE : connectBLE}
              >
                {connectedDevice ? "Disconnect device" : "Connect device"}
              </Button>
              <Button
                color="primary"
                variant="outline"
                disabled={connectedDevice === undefined || inProgress()}
                onClick={onDeploy}
              >
                Flash firmware
              </Button>
            </>
          ) : null}
          <Button
            color="primary"
            variant="outline"
            disabled={inProgress()}
            onClick={onDownloadFirmware}
          >
            Download firmware
          </Button>
        </Group>
        {inProgress() ? (
          <Text c="red" mt="xs">
            Please do not leave this page or disconnect the device, while the
            flashing is in progress.
          </Text>
        ) : null}
        {selectedDevice.ota_update ? (
          <Box mt="md">
            <Progress
              color={flashState === "uploadFinished" ? "primary" : "success"}
              value={flashProgress}
            />
          </Box>
        ) : null}
      </Box>
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

  const selectedDeviceIndex = devices.findIndex(
    (device) => device.name === selectedDevice?.name
  );

  return (
    <Modal opened={isOpen} onClose={onClose} size="xl">
      <Title order={4}>Generate firmware: {model.name}</Title>
      <Box mt="sm">
        {page === 0 ? (
          <Box>
            <Group align="center">
              <Text fw={700}>1. Select Device:</Text>
              <Select
                data={devices.map((device, idx) => ({
                  value: String(idx),
                  label: device.name,
                }))}
                value={
                  selectedDeviceIndex >= 0 ? String(selectedDeviceIndex) : null
                }
                onChange={(value) => {
                  if (value === null) return;
                  onClickSelectDevice(devices[parseInt(value, 10)]);
                }}
                size="lg"
              />
            </Group>
            <Divider my="sm" />
            <Text fw={700}>2. Configure Device:</Text>
            <Group align="flex-start" mt="sm" wrap="nowrap">
              <Box className="header-wrapper" style={{ width: "500px" }}>
                <Group justify="center" align="center">
                  <Text fw={700}>Configure TimeSeries</Text>
                </Group>
                <Box className="body-wrapper-overflow" mt="sm">
                  {model.timeSeries.map((elm, ts_idx) => {
                    const currentSelection = selectedSensors[ts_idx];
                    const currentValue =
                      currentSelection.sensor_id !== undefined
                        ? `${currentSelection.sensor_id}:${currentSelection.component_id}`
                        : null;
                    const sensorOptions = selectedDevice.sensors.flatMap(
                      (sensor, sensor_idx) =>
                        sensor.components.map((component, component_idx) => ({
                          value: `${sensor_idx}:${component_idx}`,
                          label: `${sensor.name}_${component.name}`,
                        }))
                    );
                    return (
                      <Box
                        key={"tskey" + ts_idx}
                        className="datasetCard"
                        p="sm"
                        style={{
                          background:
                            ts_idx % 2 === 1 ? "rgb(249, 251, 252)" : "",
                        }}
                      >
                        <Group justify="space-between" align="center">
                          <Text fw={700} pl="xs">
                            {elm}
                          </Text>
                          <Select
                            data={sensorOptions}
                            value={currentValue}
                            placeholder="Unset"
                            onChange={(value) => {
                              if (!value) return;
                              const [sensorIdx, componentIdx] = value
                                .split(":")
                                .map((v) => parseInt(v, 10));
                              selectSensor(ts_idx, sensorIdx, componentIdx);
                            }}
                            size="sm"
                          />
                        </Group>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
              <DeployFeatures
                onUpdateDeployFeautures={(data) => setDeployFeatures(data)}
                featureNames={selectedDevice.deploy_features}
              />
            </Group>
            <Divider my="sm" />
            <Box m="sm">
              <Text fw={700}>3. Additional Settings:</Text>
              <HyperparameterView
                hyperparameters={parameters}
                isAdvanced={false}
                handleHyperparameterChange={handleHyperparameterChange}
              />
            </Box>
            {flashError ? (
              <Group align="center" ml="sm">
                <FontAwesomeIcon icon={faCircleExclamation} color="red" />
                <Text c="red">
                  An error occured while flashing the model onto the device.
                </Text>
              </Group>
            ) : null}
            <Group justify="space-between" align="center" mt="sm">
              <Text c="red" style={{ flexGrow: 1 }}>
                {showSelectAllSensorWarning
                  ? "Please configure all time series under configure time series before deploying."
                  : ""}
              </Text>
              <Box>
                {/* <Button variant="outline" color="blue" onClick={onSwitchPage}>
                  Deploy
                </Button> */}
                <Button
                  variant="outline"
                  color="blue"
                  onClick={checkAndDownloadFirmware}
                >
                  Download firmware
                </Button>
              </Box>
            </Group>
          </Box>
        ) : (
          <Box>{renderDeployPart()}</Box>
        )}
      </Box>
      <Group justify="flex-end" mt="md">
        {page == 1 ? (
          <Button variant="outline" color="blue" onClick={onGoBack}>
            Back
          </Button>
        ) : null}
        <Button onClick={onClose} variant="outline" color="red">
          Cancel
        </Button>
      </Group>
    </Modal>
  );
};

export default DeployModal;
