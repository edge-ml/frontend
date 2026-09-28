import "./BleActivated.css";

import React from "react";
import { Badge, Group, Paper, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconActivityHeartbeat, IconPointFilled } from "@tabler/icons-react";
import BlePanelSensorstreamGraph from "./BlePanelSensorstreamGraph";

const BlePanelRecordingDisplay = ({
  deviceSensors,
  selectedSensors,
  lastData,
  sensorKeys,
  fullSampleRate,
  currentLabel,
  prevLabel,
  recordingStartTime,
}) => (
  <section className="ble-recording-panel" aria-label="Live sensor data">
    <Group justify="space-between" align="flex-start" mb="md">
      <Group gap="sm">
        <ThemeIcon variant="light" color="blue" size="lg">
          <IconActivityHeartbeat size={19} />
        </ThemeIcon>
        <div>
          <Text fw={700} size="lg">
            Live sensor data
          </Text>
          <Text size="sm" c="dimmed">
            A rolling 30-second view of the data being recorded
          </Text>
        </div>
      </Group>
      <Badge
        color="red"
        variant="light"
        leftSection={<IconPointFilled size={12} />}
      >
        Recording
      </Badge>
    </Group>

    <Stack gap="md">
      {Array.from(selectedSensors).map((sensorKey) => {
        const sensorIndex = sensorKeys.indexOf(sensorKey.toString());
        const sensor = deviceSensors[sensorKey];
        const sampleRate = sensor.options
          ? sensor.options.frequencies.frequencies[sensor.sampleRate]
          : sensor.sampleRate;

        return (
          <Paper
            className="ble-sensor-chart-card"
            key={sensorKey}
            withBorder
            radius="md"
          >
            <Group justify="space-between" px="md" pt="md" pb="xs">
              <div>
                <Text fw={650}>{sensor.name}</Text>
                <Text size="xs" c="dimmed">
                  {sensor.parseScheme.length} channel
                  {sensor.parseScheme.length === 1 ? "" : "s"} · {sampleRate} Hz
                </Text>
              </div>
              <Badge variant="dot" color="teal">
                Streaming
              </Badge>
            </Group>
            <BlePanelSensorstreamGraph
              sensor={sensor}
              fullSampleRate={fullSampleRate}
              lastData={lastData[sensorIndex]}
              currentLabel={currentLabel}
              prevLabel={prevLabel}
              recordingStartTime={recordingStartTime}
            />
          </Paper>
        );
      })}
    </Stack>
  </section>
);

export default BlePanelRecordingDisplay;
