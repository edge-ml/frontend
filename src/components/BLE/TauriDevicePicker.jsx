import React, { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Group,
  Loader,
  Modal,
  Paper,
  Radio,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { IconBluetooth, IconBluetoothConnected } from "@tabler/icons-react";
import {
  resolveDeviceSelection,
  rejectDeviceSelection,
} from "../../services/tauriBle";

const TauriDevicePicker = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const handler = (event) => {
      setDevices(event.detail.devices);
      setSelectedId(null);
      setIsOpen(true);
    };

    window.addEventListener("tauri-ble-device-picker", handler);
    return () => window.removeEventListener("tauri-ble-device-picker", handler);
  }, []);

  const handleConnect = () => {
    if (!selectedId) return;
    const device = devices.find((candidate) => candidate.id === selectedId);
    if (device) {
      setIsOpen(false);
      resolveDeviceSelection(device);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    rejectDeviceSelection(
      new DOMException("Device selection cancelled", "NotFoundError")
    );
  };

  return (
    <Modal
      opened={isOpen}
      onClose={handleCancel}
      size="lg"
      centered
      title={
        <Group gap="sm">
          <ThemeIcon variant="light" color="blue" radius="xl">
            <IconBluetooth size={18} />
          </ThemeIcon>
          <div>
            <Text fw={700}>Select a Bluetooth device</Text>
            <Text size="xs" c="dimmed" fw={400}>
              Choose the sensor device you want to record from.
            </Text>
          </div>
        </Group>
      }
    >
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {devices.length === 0
              ? "Looking for nearby devices…"
              : `${devices.length} nearby device${
                  devices.length === 1 ? "" : "s"
                } found`}
          </Text>
          {devices.length > 0 && (
            <Badge variant="light" color="teal">
              Scan complete
            </Badge>
          )}
        </Group>

        {devices.length === 0 ? (
          <Paper withBorder radius="md" p="xl" style={{ textAlign: "center" }}>
            <Loader size="sm" mb="sm" />
            <Text size="sm" c="dimmed">
              Keep your device nearby and make sure it is discoverable.
            </Text>
          </Paper>
        ) : (
          <ScrollArea.Autosize mah={360} offsetScrollbars>
            <Radio.Group
              value={selectedId || ""}
              onChange={setSelectedId}
              aria-label="Available Bluetooth devices"
            >
              <Stack gap="xs">
                {devices.map((device) => {
                  const selected = selectedId === device.id;
                  return (
                    <UnstyledButton
                      key={device.id}
                      component="label"
                      htmlFor={`tauri-device-${device.id}`}
                    >
                      <Paper
                        withBorder
                        radius="md"
                        p="md"
                        style={{
                          borderColor: selected
                            ? "var(--mantine-color-blue-5)"
                            : undefined,
                          background: selected
                            ? "var(--mantine-color-blue-0)"
                            : undefined,
                          cursor: "pointer",
                        }}
                      >
                        <Group wrap="nowrap">
                          <ThemeIcon
                            variant="light"
                            color={selected ? "blue" : "gray"}
                            radius="xl"
                            size="lg"
                          >
                            {selected ? (
                              <IconBluetoothConnected size={18} />
                            ) : (
                              <IconBluetooth size={18} />
                            )}
                          </ThemeIcon>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <Text fw={650} truncate>
                              {device.name || "Unknown device"}
                            </Text>
                            <Text size="xs" c="dimmed" truncate>
                              {device.id}
                            </Text>
                          </div>
                          <Radio
                            id={`tauri-device-${device.id}`}
                            value={device.id}
                            aria-label={`Select ${
                              device.name || "unknown device"
                            }`}
                          />
                        </Group>
                      </Paper>
                    </UnstyledButton>
                  );
                })}
              </Stack>
            </Radio.Group>
          </ScrollArea.Autosize>
        )}

        <Group justify="flex-end" mt="xs">
          <Button variant="subtle" color="gray" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleConnect}
            disabled={!selectedId}
            leftSection={<IconBluetoothConnected size={17} />}
          >
            Connect device
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default TauriDevicePicker;
