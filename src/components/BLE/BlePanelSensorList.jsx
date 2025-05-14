import React from "react";
import { Table, Input, InputGroup, InputGroupText, Badge } from "reactstrap";
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
                  <td className="align-middle">
                    <Checkbox
                      disabled={disabled}
                      isSelected={selectedSensors.has(sensorKey)}
                      className="datasets-check"
                      onClick={() => onToggleSensor(sensorKey)}
                    ></Checkbox>
                  </td>
                  <td className="align-middle">{sensorData.name}</td>
                  <td className="align-middle">
                    <InputGroup
                      style={{ margin: 0, minWidth: "90px" }}
                      size="sm"
                    >
                      <Input
                        value={sensorData.sampleRate}
                        disabled={disabled}
                        onChange={(e) =>
                          onChangeSampleRate(sensorKey, e.target.value)
                        }
                        type="number"
                        min={0}
                        max={50}
                      ></Input>
                      <InputGroupText>Hz</InputGroupText>
                    </InputGroup>
                  </td>
                  <td className="align-middle">
                    {sensorData.parseScheme.map((elm, index) => (
                      <Badge color="primary" key={elm.name + index}>
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
            <small className="text-danger">
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
