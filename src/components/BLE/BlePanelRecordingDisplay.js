import React from 'react';
import './BleActivated.css';
import BlePanelSensorGraph from './BlePanelSensorGraph';

function BlePanelRecordingDisplay(props) {
  let indices = Array.from(props.selectedSensors);

  return (
    <div>
      <div className="panelHeader">4. Recording</div>
      <div className="panelDivider"></div>
      <ul>
        {indices.map(sensorKey => {
          const sensorData = props.deviceSensors[sensorKey];
          return (
            <li key={sensorKey}>
              <BlePanelSensorGraph
                name={sensorData.name}
                components={sensorData.parseScheme.map(elm => elm.name)}
                recorderState={props.recorderState}
                value={props.lastData[parseInt(sensorKey)]}
              ></BlePanelSensorGraph>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default BlePanelRecordingDisplay;
