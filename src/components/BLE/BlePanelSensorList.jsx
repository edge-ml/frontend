import React from "react";
import { Badge, Box, Group, NumberInput, Select, Table, Text, Title } from "@mantine/core";
import Checkbox from "../Common/Checkbox";

function BlePanelSensorList({
  sensors = {},
  selectedSensors = new Set(),
  disabled = false,
  onToggleSensor,
  onChangeSampleRate,
  maxSampleRate,
}) {
  if (!sensors || Object.keys(sensors).length === 0) {
    return null;
  }

  let sampleRateSum = 0;
  selectedSensors.forEach((elm) => {
    sampleRateSum += sensors[elm].sampleRate;
  });

  console.log("SensorData", sensors);

  return (
    <Box m="sm">
      <Box className="header-wrapper">
        <Title order={4}>2. Configure sensors</Title>
      </Box>
      <Box className="body-wrapper">
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Select</Table.Th>
              <Table.Th>SensorName</Table.Th>
              <Table.Th>Sample rate</Table.Th>
              <Table.Th>Components</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {Object.keys(sensors).map((sensorKey) => {
              const sensorData = sensors[sensorKey];
              return (
                <Table.Tr key={sensorKey}>
                  <Table.Td style={{ verticalAlign: "middle" }}>
                    <Checkbox
                      disabled={disabled}
                      isSelected={selectedSensors.has(sensorKey)}
                      className="datasets-check"
                      onClick={() => onToggleSensor(sensorKey)}
                    />
                  </Table.Td>
                  <Table.Td style={{ verticalAlign: "middle" }}>
                    {sensorData.name}
                  </Table.Td>
                  <Table.Td style={{ verticalAlign: "middle" }}>
                    <Group gap="xs" align="center" wrap="nowrap">
                      {sensorData.options ? (
                        <Select
                          value={String(sensorData.sampleRate)}
                          disabled={disabled}
                          onChange={(value) => {
                            if (value === null) return;
                            onChangeSampleRate(sensorKey, parseInt(value, 10));
                          }}
                          data={sensorData.options.frequencies.frequencies.map(
                            (elm, index) => ({
                              value: String(index),
                              label: String(elm),
                            })
                          )}
                          w={120}
                          size="xs"
                        />
                      ) : (
                        <NumberInput
                          value={sensorData.sampleRate}
                          disabled={disabled}
                          onChange={(value) =>
                            onChangeSampleRate(sensorKey, value)
                          }
                          min={0}
                          max={50}
                          w={120}
                          size="xs"
                        />
                      )}
                      <Text size="xs">Hz</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td style={{ verticalAlign: "middle" }}>
                    <Group gap="xs" wrap="wrap">
                      {sensorData.parseScheme.map((elm, index) => (
                        <Badge color="blue" key={elm.name + index}>
                          {elm.name + (elm.unit ? ` (${elm.unit})` : "")}
                        </Badge>
                      ))}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
        {sampleRateSum > maxSampleRate && (
          <Box p="sm">
            <Text size="xs" c="red">
              <Text component="span" fw={700}>
                Warning:
              </Text>{" "}
              Collecting data from multiple sensors with high sampling rate can
              cause delays / errors during recording. It is recommended to keep
              the sum of sample rates below {maxSampleRate} Hz. You are
              currently at {sampleRateSum} Hz.
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default BlePanelSensorList;
