import React from "react";
import {
  Alert,
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconBluetooth,
  IconBluetoothConnected,
  IconCheck,
  IconRefresh,
  IconUnlink,
} from "@tabler/icons-react";
import SpinnerButton from "../Common/SpinnerButton";

const BlePanelConnectDevice = ({
  bleConnectionChanging,
  toggleBLEDeviceConnection,
  connectedBLEDevice,
  hasDFUFunction,
  toggleDFUModal,
  deviceNotUsable,
  isEdgeMLInstalled,
  outdatedVersionInstalled,
  connectedDeviceData,
  connectionError,
}) => {
  const isConnected = Boolean(connectedBLEDevice);
  const displayName =
    connectedDeviceData?.name || connectedBLEDevice?.name || "Bluetooth device";

  return (
    <Paper className="ble-connect-card" withBorder radius="lg">
      <div className="ble-connect-card__main">
        <Group gap="md" wrap="nowrap">
          <ThemeIcon
            className="ble-connect-card__icon"
            size={48}
            radius="xl"
            variant="light"
            color={isConnected ? "teal" : "blue"}
          >
            {isConnected ? (
              <IconBluetoothConnected size={25} />
            ) : (
              <IconBluetooth size={25} />
            )}
          </ThemeIcon>
          <Stack gap={3}>
            <Group gap="xs">
              <Text fw={700} size="lg">
                {isConnected ? displayName : "Connect a sensor device"}
              </Text>
              {isConnected && isEdgeMLInstalled && (
                <Badge
                  color="teal"
                  variant="light"
                  leftSection={<IconCheck size={12} />}
                >
                  Ready
                </Badge>
              )}
            </Group>
            <Text size="sm" c="dimmed">
              {isConnected
                ? connectedDeviceData?.installedFWVersion
                  ? `Firmware ${connectedDeviceData.installedFWVersion}`
                  : `Device ID ${connectedBLEDevice.id}`
                : "Choose a nearby Edge ML device to configure its sensors and start recording."}
            </Text>
          </Stack>
        </Group>

        <Group gap="sm" className="ble-connect-card__actions">
          {isConnected &&
            hasDFUFunction &&
            (outdatedVersionInstalled || !isEdgeMLInstalled) && (
              <Button
                variant="light"
                leftSection={<IconRefresh size={17} />}
                onClick={toggleDFUModal}
              >
                Install firmware
              </Button>
            )}
          <SpinnerButton
            variant={isConnected ? "subtle" : "filled"}
            color={isConnected ? "red" : "blue"}
            leftSection={
              isConnected ? (
                <IconUnlink size={17} />
              ) : (
                <IconBluetooth size={17} />
              )
            }
            loadingtext={isConnected ? "Disconnecting" : "Connecting"}
            loading={bleConnectionChanging}
            onClick={toggleBLEDeviceConnection}
          >
            {isConnected ? "Disconnect" : "Connect device"}
          </SpinnerButton>
        </Group>
      </div>

      {connectionError && (
        <Alert
          color="red"
          variant="light"
          icon={<IconAlertCircle size={18} />}
          mt="md"
        >
          {connectionError}
        </Alert>
      )}
      {deviceNotUsable && (
        <Alert
          color="orange"
          variant="light"
          icon={<IconAlertCircle size={18} />}
          mt="md"
          title="Unsupported firmware"
        >
          This device does not expose the Edge ML sensor service. Install a
          compatible firmware before recording.
        </Alert>
      )}
    </Paper>
  );
};

export default BlePanelConnectDevice;
