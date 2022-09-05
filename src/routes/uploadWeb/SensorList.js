import { Badge, Table, Input, InputGroup, InputGroupAddon } from 'reactstrap';
import React from 'react';

export const SensorList = ({
  sensors,
  selectedSensors,
  setSensor,
  setSensorRate,
  disabled = false,
}) => (
  <Table>
    <thead className="bg-light">
      <tr>
        <th></th>
        <th>Sensor</th>
        <th>Sample rate</th>
        <th>Components</th>
      </tr>
    </thead>
    <tbody>
      {sensors.map(
        ({
          name,
          shortComponents,
          sampleRate,
          properties: { fixedFrequency },
        }) => {
          return (
            <tr key={name}>
              <td>
                {' '}
                <Input
                  onChange={(e) => setSensor(name, !selectedSensors[name])}
                  className="datasets-check"
                  checked={selectedSensors[name]}
                  type="checkbox"
                />
              </td>
              <td>{name}</td>
              <td>
                {fixedFrequency ? null : (
                  <InputGroup style={{ margin: 0, minWidth: '90px' }} size="sm">
                    <Input
                      value={sampleRate}
                      onChange={(e) => setSensorRate(name, e.target.value)}
                      type="number"
                      min={0}
                      max={50}
                    ></Input>{' '}
                    <InputGroupAddon addonType="append">Hz</InputGroupAddon>
                  </InputGroup>
                )}
              </td>
              <td>
                {shortComponents.map((c) => (
                  <Badge className="m-1">{c}</Badge>
                ))}
              </td>
            </tr>
          );
        }
      )}
    </tbody>
  </Table>
);
