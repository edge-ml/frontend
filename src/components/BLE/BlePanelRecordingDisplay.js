import React from 'react';
import { Table } from 'reactstrap';
import './BleActivated.css';

function BlePanelRecordingDisplay(props) {
  let indices = Array.from(props.selectedSensors);

  function separateComponents(dataArray) {
    return Array.isArray(dataArray)
      ? roundComponents(dataArray).join('; ')
      : ' ';
  }

  function roundComponents(dataArray) {
    return dataArray.map(function (element) {
      return element % 1 === 0 ? element : element.toFixed(4);
    });
  }

  return (
    <div>
      <div className="panelHeader">4. Recording</div>
      <div className="panelDivider"></div>
      <Table style={{ tableLayout: 'fixed' }}>
        <thead>
          <tr className="bg-light">
            <th>SensorName</th>
            <th>Components</th>
            <th>CurrentData</th>
          </tr>
        </thead>
        <tbody>
          {indices.map((sensorKey) => {
            const sensorData = props.deviceSensors[sensorKey];
            return (
              <tr key={sensorKey}>
                <td>{sensorData.name}</td>
                <td>
                  {sensorData.parseScheme.map((elm) => elm.name).join('; ')}
                </td>
                <td>
                  {separateComponents(props.lastData[parseInt(sensorKey)])}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}

export default BlePanelRecordingDisplay;
