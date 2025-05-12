import "./BleActivated.css";

import React, { useMemo, useRef } from "react";
import BlePanelSensorstreamGraph from "./BlePanelSensorstreamGraph";



const BlePanelRecordingDisplay = ({ bleRecorder, bleDeviceHandler }) => {
  const recordingStartTimeRef = useRef(Date.now());

  const { selectedSensors, currentLabel, prevLabel } = bleRecorder;
  const { sensorConfig } = bleDeviceHandler;

  const allOptions = useMemo(() => {
    const optionsArray = [];
    for (const key of Object.keys(sensorConfig)) {
      optionsArray.push(
        getOptions(
          sensorConfig[key].parseScheme.map((elm) => elm.name),
          sensorConfig[key].name,
          recordingStartTimeRef.current
        )
      );
    }
    return optionsArray;
  }, [sensorConfig]);

  function getOptions(components, name, recordingStartTime) {
    return {
      chart: {
        type: "spline",
        animation: false, // don't animate in old IE
        marginRight: 10,
        useSVG: true,
      },
      boost: {
        useGPUTranslations: true,
      },
      series: generateStartData(components, recordingStartTime),
      title: {
        text: name,
      },
      xAxis: {
        min: recordingStartTime, // current time
        max: recordingStartTime + 30000, // current time + 30s
        type: "datetime",
        tickPixelInterval: 100,
        labels: {
          enabled: true,
          rotation: 20,
          overflow: "allow",
          formatter: function () {
            // calculate the time since the recording started in seconds
            const seconds = Math.round(
              (this.value - recordingStartTime) / 1000
            );
            if (seconds < 0) {
              return "";
            }
            return seconds + "s";
          },
        },
      },
      yAxis: {
        title: false,
        labels: {
          enabled: true,
        },
      },
    };
  }

  function generateStartData(components, recordingStartTime) {
    const all_series = [];
    for (let j = -components.length; j < 0; j += 1) {
      all_series.push({
        name: components[j + components.length],
        data: [{ x: recordingStartTime, y: 0 }],
        marker: {
          enabled: false,
        },
      });
    }
    return all_series;
  }

  return (
    <div className="m-2">
      <div className="header-wrapper d-flex justify-content-flex-start align-content-center">
        <h4>5. Recording</h4>
      </div>
      <div className="body-wrapper">
        <ul>
          {Array.from(selectedSensors).map((sensorKey) => {
            return (
              <li key={sensorKey}>
                <BlePanelSensorstreamGraph
                  options={
                    allOptions[Object.keys(sensorConfig).indexOf(sensorKey.toString())]
                  }
                  fullSampleRate={false}
                  // sampleRate={props.sensorConfig[sensorKey].sampleRate}
                  // lastData={props.lastData}
                  index={Object.keys(sensorConfig).indexOf(sensorKey.toString())}
                  currentLabel={currentLabel}
                  prevLabel={prevLabel}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default BlePanelRecordingDisplay;
