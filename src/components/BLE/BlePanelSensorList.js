import React from 'react';
import { Table, Input, InputGroup, InputGroupAddon } from 'reactstrap';

function BlePanelSensorList(props) {
  if (!props.sensors || props.sensors === []) {
    return null;
  }

  var sampleRateSum = 0;
  props.selectedSensors.forEach((elm) => {
    sampleRateSum += props.sensors[elm].sampleRate;
  });
  console.log(sampleRateSum);
  return (
    <div>
      <div className="panelHeader">2. Configure sensors</div>
      {sampleRateSum > props.maxSampleRate ? (
        <small className="text-danger">
          <strong>Warning: </strong>Collecting data from multiple sensors with
          high sampling rate can cause delays / errors during recording. It is
          recommended to keep the sum of sample rates below{' '}
          {props.maxSampleRate} Hz. Your are currently at {sampleRateSum} Hz.
        </small>
      ) : null}
      <div className="panelDivider"></div>
      <div
        style={
          props.disabled ? { opacity: '0.4', pointerEvents: 'none' } : null
        }
      >
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
            {Object.keys(props.sensors).map((sensorKey, index) => {
              const sensorData = props.sensors[sensorKey];
              return (
                <tr key={sensorKey}>
                  <td>
                    {' '}
                    <Input
                      onChange={(e) => props.onToggleSensor(sensorKey)}
                      className="datasets-check"
                      checked={props.selectedSensors.has(sensorKey)}
                      type="checkbox"
                    />
                  </td>
                  <td>{sensorData.name}</td>
                  <td>
                    <InputGroup
                      style={{ margin: 0, minWidth: '90px' }}
                      size="sm"
                    >
                      <Input
                        value={sensorData.sampleRate}
                        onChange={(e) =>
                          props.onChangeSampleRate(sensorKey, e.target.value)
                        }
                        type="number"
                        min={0}
                        max={50}
                      ></Input>{' '}
                      <InputGroupAddon addonType="append">Hz</InputGroupAddon>
                    </InputGroup>
                  </td>
                  <td>
                    {sensorData.parseScheme.map((elm) => elm.name).join('; ')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

BlePanelSensorList.defaultProps = {
  disabled: false,
};

export default BlePanelSensorList;
