import React from "react";
import { Alert, Badge, Button, Card, Group, Text } from "@mantine/core";
import {
  IconAlertCircle,
  IconBluetooth,
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
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <div className="ble-connect-card__main">
        <div className="flex-grow-1">
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
        </div>

        <Group gap="sm" className="ble-connect-card__actions">
          {isConnected &&
            hasDFUFunction &&
            (outdatedVersionInstalled || !isEdgeMLInstalled) && (
              <Button
                variant="outline"
                leftSection={<IconRefresh size={17} />}
                onClick={toggleDFUModal}
              >
                Install firmware
              </Button>
            )}
          <SpinnerButton
            variant="outline"
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
    </Card>
  );
};

export default BlePanelConnectDevice;
