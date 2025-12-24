import React from "react";
import SpinnerButton from "../Common/SpinnerButton";
import { Box, Button, Group, Stack, Text, Title } from "@mantine/core";

const getInfoText = (props) => {
  if (!props.connectedBLEDevice) {
    return <div>No device connected</div>;
  }
  if (props.isEdgeMLInstalled) {
    return (
      <div>
        {renderDeviceName(props)}
        {renderDeviceInfo(props)}
        {props.outdatedVersionInstalled && props.hasDFUFunction && (
          <div>
            {" "}
            The edge-ml firmware version is outdated. You can update it to the
            latest version by clicking on the button.
          </div>
        )}
      </div>
    );
  } else {
    if (props.hasDFUFunction) {
      return (
        <div>
          {renderDeviceName(props)}
          <div>
            This device does not have the edge-ml firmware installed yet. You
            can install it by clicking on the button.
          </div>
        </div>
      );
    } else {
      return (
        <div>
          {renderDeviceName(props)}
          <Text c="red">
            This device does not have the edge-ml firmware installed. Please
            install via the guide
          </Text>
        </div>
      );
    }
  }
};

const renderDeviceName = (props) => {
  if (!props.connectedBLEDevice) {
    return null;
  }
  return (
    <div>
      Connected device:{" "}
      <b>
        {props.connectedDeviceData
          ? props.connectedDeviceData.name
          : props.connectedBLEDevice.name}
      </b>{" "}
      ({props.connectedBLEDevice.id})
    </div>
  );
};

const renderDeviceInfo = (props) => {
  return (
    <div>
      Installed version:{" "}
      <strong>{props.connectedDeviceData.installedFWVersion}</strong>
      <br />
      {props.basicEdgeMLArduinoFirmware &&
        "Latest version:" + <strong>{props.latestEdgeMLVersion}</strong>}
    </div>
  );
};

const getButtonView = (props) => {
  if (!props.connectedBLEDevice) {
    return null;
  }
  if (
    (props.outdatedVersionInstalled || !props.isEdgeMLInstalled) &&
    props.hasDFUFunction &&
    props.basicEdgeMLArduinoFirmware
  ) {
    return (
      <Box>
        <Button variant="outline" color="blue" onClick={props.toggleDFUModal}>
          Flash edge-ml firmware
        </Button>
      </Box>
    );
  }
  return null;
};

function BlePanelConnectDevice(props) {
  return (
    <Box m="sm">
      <Box className="header-wrapper">
        <Title order={4}>1. Device</Title>
      </Box>
      <Box className="body-wrapper" p="sm">
        <Text size="xs" c="red">
          <Text component="span" fw={700}>
            Warning:
          </Text>{" "}
          If your device can not be found, try to turn bluetooth off and on
          again in your settings.
        </Text>
        <div className="panelDivider" />
        <Group justify="space-between" align="flex-start" mt="sm">
          <Box>{getInfoText(props)}</Box>
          <Group align="center" gap="sm">
            {getButtonView(props)}
            <SpinnerButton
              outline
              loadingtext={
                props.connectedBLEDevice ? "Disconnecting..." : "Connecting..."
              }
              color={props.connectedBLEDevice ? "danger" : "primary"}
              spinnercolor={props.connectedBLEDevice ? "danger" : "primary"}
              loading={props.bleConnectionChanging}
              onClick={props.toggleBLEDeviceConnection}
            >
              {props.connectedBLEDevice
                ? "Disconnect device"
                : "Connect device"}
            </SpinnerButton>
          </Group>
        </Group>
      </Box>
    </Box>
  );
}

export default BlePanelConnectDevice;
