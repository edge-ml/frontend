import React from "react";
import {
  Alert,
  Badge,
  Checkbox,
  Group,
  NativeSelect,
  Paper,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

const getSampleRateLabel = (sensor) => {
  if (!sensor.options) return sensor.sampleRate;
  return (
    sensor.options.frequencies.frequencies[sensor.sampleRate] ??
    sensor.sampleRate
  );
};

const BlePanelSensorList = ({
  sensors = {},
  selectedSensors = new Set(),
  disabled = false,
  onToggleSensor,
  onChangeSampleRate,
  maxSampleRate,
}) => {
  if (!sensors || Object.keys(sensors).length === 0) return null;

  const sampleRateSum = Array.from(selectedSensors).reduce(
    (sum, sensorKey) => sum + Number(getSampleRateLabel(sensors[sensorKey])),
    0
  );
  const hasRateWarning =
    Number.isFinite(maxSampleRate) && sampleRateSum > maxSampleRate;

  return (
    <Stack gap="sm">
      {Object.keys(sensors).map((sensorKey) => {
        const sensor = sensors[sensorKey];
        const selected = selectedSensors.has(sensorKey);

        return (
          <Paper
            key={sensorKey}
            className={`ble-sensor-option${
              selected ? " ble-sensor-option--selected" : ""
            }`}
            withBorder
            radius="md"
            p="md"
          >
            <div className="ble-sensor-option__row">
              <Checkbox
                checked={selected}
                disabled={disabled}
                onChange={() => onToggleSensor(sensorKey)}
                aria-label={`Select ${sensor.name}`}
              />
              <div className="ble-sensor-option__details">
                <Text fw={650}>{sensor.name}</Text>
                <Group gap={6} mt={6}>
                  {sensor.parseScheme.map((component, index) => (
                    <Badge
                      color="gray"
                      variant="light"
                      size="sm"
                      key={`${component.name}-${index}`}
                    >
                      {component.name}
                      {component.unit ? ` · ${component.unit}` : ""}
                    </Badge>
                  ))}
                </Group>
              </div>
              <div className="ble-sensor-option__rate">
                {sensor.options ? (
                  <NativeSelect
                    label="Sample rate"
                    value={String(sensor.sampleRate)}
                    disabled={disabled || !selected}
                    onChange={(event) =>
                      onChangeSampleRate(
                        sensorKey,
                        Number.parseInt(event.target.value)
                      )
                    }
                    data={sensor.options.frequencies.frequencies.map(
                      (frequency, index) => ({
                        value: String(index),
                        label: `${frequency} Hz`,
                      })
                    )}
                    size="xs"
                  />
                ) : (
                  <TextInput
                    label="Sample rate"
                    value={sensor.sampleRate}
                    disabled={disabled || !selected}
                    onChange={(event) =>
                      onChangeSampleRate(sensorKey, event.target.value)
                    }
                    type="number"
                    min={1}
                    max={50}
                    rightSection="Hz"
                    size="xs"
                  />
                )}
              </div>
            </div>
          </Paper>
        );
      })}

      {hasRateWarning && (
        <Alert
          color="orange"
          variant="light"
          icon={<IconAlertTriangle size={17} />}
        >
          The selected sensors total {sampleRateSum} Hz. Staying below{" "}
          {maxSampleRate} Hz is recommended for a stable Bluetooth stream.
        </Alert>
      )}
    </Stack>
  );
};

export default BlePanelSensorList;
