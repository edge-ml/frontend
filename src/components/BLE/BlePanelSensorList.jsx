import React from "react";
import { Table, NativeSelect, TextInput, Badge } from "@mantine/core";
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

  return (
    <div className="m-2">
      <div className="header-wrapper d-flex justify-content-flex-start align-content-center">
        <h4>2. Configure sensors</h4>
      </div>
      <div className="body-wrapper">
        <Table>
          <thead>
            <tr className="bg-light">
              <th>Select</th>
              <th>SensorName</th>
              <th>Sample rate</th>
              <th>Components</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(sensors).map((sensorKey) => {
              const sensorData = sensors[sensorKey];
              return (
                <tr key={sensorKey}>
                  <td style={{ verticalAlign: "middle" }}>
                    <Checkbox
                      disabled={disabled}
                      isSelected={selectedSensors.has(sensorKey)}
                      className="datasets-check"
                      onClick={() => onToggleSensor(sensorKey)}
                    />
                  </td>
                  <td style={{ verticalAlign: "middle" }}>{sensorData.name}</td>
                  <td style={{ verticalAlign: "middle" }}>
                    {sensorData.options ? (
                      <NativeSelect
                        value={sensorData.sampleRate}
                        disabled={disabled}
                        onChange={(e) => {
                          onChangeSampleRate(
                            sensorKey,
                            parseInt(e.target.value)
                          );
                        }}
                        data={sensorData.options.frequencies.frequencies.map((elm, index) => ({
                          value: String(index),
                          label: elm,
                        }))}
                        rightSection="Hz"
                        size="sm"
                      />
                    ) : (
                      <TextInput
                        value={sensorData.sampleRate}
                        disabled={disabled}
                        onChange={(e) =>
                          onChangeSampleRate(sensorKey, e.target.value)
                        }
                        type="number"
                        min={0}
                        max={50}
                        size="sm"
                      />
                    )}
                  </td>
                  <td style={{ verticalAlign: "middle" }}>
                    {sensorData.parseScheme.map((elm, index) => (
                      <Badge color="blue" key={elm.name + index} style={{ marginRight: "4px" }}>
                        {elm.name + (elm.unit ? ` (${elm.unit})` : "")}
                      </Badge>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        {sampleRateSum > maxSampleRate && (
          <div className="p-2">
            <small style={{ color: "red" }}>
              <strong>Warning: </strong>Collecting data from multiple sensors
              with high sampling rate can cause delays / errors during
              recording. It is recommended to keep the sum of sample rates below{" "}
              {maxSampleRate} Hz. You are currently at {sampleRateSum} Hz.
            </small>
          </div>
        )}
      </div>
    </div>
  );
}

export default BlePanelSensorList;
