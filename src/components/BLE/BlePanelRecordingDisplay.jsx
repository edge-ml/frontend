import "./BleActivated.css";

import React, { useMemo, useRef } from "react";
import BlePanelSensorstreamGraph from "./BlePanelSensorstreamGraph";



const BlePanelRecordingDisplay = ({ bleRecorder, bleDeviceHandler }) => {
  const recordingStartTimeRef = useRef(Date.now());

  const { selectedSensors, currentLabel, prevLabel, currentData } = bleRecorder;
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

  // Transform currentData into lastData format expected by BlePanelSensorstreamGraph
  // lastData is an array where each element corresponds to a sensor index and contains [timestamp, [values]]
  // const lastData = useMemo(() => {
  //   if (!currentData || Object.keys(currentData).length === 0) {
  //     return [];
  //   }

  //    ("currentData", currentData);

  //   const sensorKeysArray = Object.keys(sensorConfig);

  //   const lastDataArray = sensorKeysArray.map((sensorKey) => {
  //     const sensorDataPoints = currentData[sensorKey];
  //     if (sensorDataPoints && sensorDataPoints.length > 0) {
  //       const latest = sensorDataPoints[sensorDataPoints.length - 1];
  //       return [latest[0], latest[1]];
  //     } else {
  //       const components = sensorConfig[sensorKey].parseScheme.map((elm) => elm.name);
  //       return [Date.now(), components.map(() => 0)];
  //     }
  //   });

  //   return lastDataArray;
  // }, [currentData, sensorConfig]);

  function getOptions(components, name, recordingStartTime) {

    // Recordingstarttie in milliseconds
    const recordingStartTimeInMs = recordingStartTime;

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
        max: recordingStartTime + 10000, // current time + 30s
        type: "datetime",
        tickPixelInterval: 100,
        labels: {
          enabled: true,
          rotation: 20,
          overflow: "allow",
          formatter: function () {
            // display time in seconds from the first timestamp in the data
            const seconds = Math.round((this.value - recordingStartTimeInMs) / 1000);
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

  function generateStartData(components) {
    const all_series = [];
    for (let j = -components.length; j < 0; j += 1) {
      all_series.push({
        name: components[j + components.length],
        data: [],
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
                  recordingStartTime={recordingStartTimeRef.current}
                  fullSampleRate={false}
                  // sampleRate={props.sensorConfig[sensorKey].sampleRate}
                  currentData={currentData[sensorKey]}
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
