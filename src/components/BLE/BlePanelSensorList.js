import React from 'react';
import { Table, Input } from 'reactstrap';

function BlePanelSensorList(props) {
  if (!props.sensors || props.sensors === []) {
    return null;
  }
  return (
    <div>
      <div className="panelHeader">2. Configure sensors</div>
      <div className="panelDivider"></div>
      <div
        style={
          props.disabled ? { opacity: '0.4', pointerEvents: 'none' } : null
        }
      >
        <Table style={{ width: 'fit-content' }}>
          <thead>
            <tr className="bg-light">
              <th>Select</th>
              <th>SensorName</th>
              <th>SensorType</th>
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
                      onChange={e => props.onToggleSensor(sensorKey)}
                      className="datasets-check"
                      type="checkbox"
                    />
                  </td>
                  <td>{sensorData.name}</td>
                  <td>{sensorData.type}</td>
                  <td>
                    {sensorData.parseScheme.map(elm => elm.name).join('; ')}
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
  disabled: false
};

export default BlePanelSensorList;
