import { useEffect, useState, useMemo } from "react";
import { Box, Button, Group, Modal, Progress, Stack, Text, Title } from "@mantine/core";
import { getArduinoFirmware } from "../../../services/ApiServices/ArduinoFirmwareServices";
import DFUManager from "./DFU";

const DFUModal = ({
  onDisconnection,
  connectedBLEDevice,
  connectedDeviceData,
  latestEdgeMLVersion,
  isEdgeMLInstalled,
  showDFUModal,
  toggleDFUModal,
}) => {
  const [flashState, setFlashState] = useState("start"); //start, connected, downloadingFW, uploading, finished
  const [flashError, setFlashError] = useState(undefined);
  const [flashProgress, setFlashProgress] = useState(0);
  const [connectedDevice, setConnectedDevice] = useState(connectedBLEDevice);

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
    dfuManager.connectGATTdfu(connectedDevice);
    document.addEventListener("keydown", onKeyPressed, false);
    return () => {
      document.removeEventListener("keydown", onKeyPressed, false);
      setFlashState("start");
      setFlashProgress(0);
      setConnectedDevice(undefined);
    };
  }, []);

  useEffect(() => {
    if (flashError) {
      onDisconnection();
    }
  }, [flashError]);

  const onKeyPressed = (e) => {
    switch (e.key) {
      case "Escape":
        if (flashState !== "downloadingFW" && flashState !== "uploading") {
          toggleDFUModal();
        }
        break;
      case "Enter":
        if (flashState === "start") {
          downLoadAndInstallFW();
        }
        break;
    }
  };

  const downLoadAndInstallFW = async () => {
    downloadFirmware()
      .then((firmware) => dfuManager.flashFirmware(firmware))
      .catch((err) => {
        setFlashError(err);
      });
  };

  const downloadFirmware = async () => {
    setFlashState("downloadingFW");
    let downloadName = "";
    switch (connectedDeviceData ? connectedDeviceData.name : undefined) {
      case "NICLA":
        downloadName = "nicla";
        break;
      case "NANO":
        downloadName = "nano";
        break;
      case "Seeed XIAO":
        downloadName = "xiao";
        break;
      default:
        downloadName = "nicla";
        break;
    }
    return getArduinoFirmware(downloadName);
  };

  const renderProgressInfo = () => {
    switch (flashState) {
      case "start":
        return "Update has not started yet";
      case "downloadingFW":
        return "Downloading firmware...";
      case "uploading":
        return "Flashing firmware over BLE...";
      case "finished":
        return "The firmware update is completed";
    }
  };

  const renderModalBody = () => {
    if (flashError) {
      return <Text c="red">{flashError}</Text>;
    } else {
      return (
        <Stack align="stretch" gap="sm">
          <Text>
            Connected BLE device:{" "}
            {
              <strong>
                {connectedDeviceData
                  ? connectedDeviceData.name
                  : connectedBLEDevice.name}
              </strong>
            }
          </Text>
          <Text>
            Latest edge-ml version: <strong>{latestEdgeMLVersion}</strong>
          </Text>
          <Text>
            {isEdgeMLInstalled
              ? "This device already has edge-ml installed, but an update is possible. Please do not close this window, while the firmware is flashing."
              : "This device does not have edge-ml installed. Flash now to install the firmware. Please do not close this window, while the firmware is flashing."}
          </Text>
          <Box className="panelDivider" />
          <Group justify="space-between" align="center">
            <Text>
              You can download and install the latest version of the edge-ml
              firmware by clicking on the update button.
            </Text>
            <Button
              variant="outline"
              color="primary"
              disabled={flashState !== "connected"}
              onClick={downLoadAndInstallFW}
            >
              Update firmware
            </Button>
          </Group>
          <Box className="panelDivider" />

          <Box mt="md">
            <Progress
              color={flashState === "uploadFinished" ? "primary" : "success"}
              value={flashProgress}
            />
          </Box>
          <Group justify="center" align="center">
            <Text>{renderProgressInfo()}</Text>
          </Group>
        </Stack>
      );
    }
  };

  return (
    <Modal
      opened={showDFUModal}
      onClose={toggleDFUModal}
      size="xl"
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Title order={4}>Update firmware</Title>
      <Box mt="md">{renderModalBody()}</Box>
      <Group justify="flex-end" mt="md">
        <Button
          variant="outline"
          color="red"
          onClick={toggleDFUModal}
          disabled={flashState === "downloadingFW" || flashState === "uploading"}
        >
          Cancel
        </Button>
      </Group>
    </Modal>
  );
};
export default DFUModal;
