import React from 'react';
import { Table, Input, InputGroup, InputGroupAddon } from 'reactstrap';
import Checkbox from '../Common/Checkbox';

function BlePanelSensorList(props) {
  if (!props.sensors || props.sensors === []) {
    return null;
  }

  var sampleRateSum = 0;
  props.selectedSensors.forEach((elm) => {
    sampleRateSum += props.sensors[elm].sampleRate;
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
            {Object.keys(props.sensors).map((sensorKey, index) => {
              const sensorData = props.sensors[sensorKey];
              return (
                <tr key={sensorKey}>
                  <td>
                    {' '}
                    <Checkbox
                      disabled={props.disabled}
                      isSelected={props.selectedSensors.has(sensorKey)}
                      className="datasets-check"
                      onClick={(e) => props.onToggleSensor(sensorKey)}
                    ></Checkbox>
                  </td>
                  <td>{sensorData.name}</td>
                  <td>
                    <InputGroup
                      style={{ margin: 0, minWidth: '90px' }}
                      size="sm"
                    >
                      <Input
                        value={sensorData.sampleRate}
                        disabled={props.disabled}
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
        {sampleRateSum > props.maxSampleRate ? (
          <div className="p-2">
            <small className="text-danger">
              <strong>Warning: </strong>Collecting data from multiple sensors
              with high sampling rate can cause delays / errors during
              recording. It is recommended to keep the sum of sample rates below{' '}
              {props.maxSampleRate} Hz. Your are currently at {sampleRateSum}{' '}
              Hz.
            </small>
          </div>
        ) : null}
      </div>
    </div>
  );
}

BlePanelSensorList.defaultProps = {
  disabled: false,
};

export default BlePanelSensorList;
