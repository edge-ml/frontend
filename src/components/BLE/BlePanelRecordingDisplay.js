import './BleActivated.css';

import React, { Component } from 'react';
import Highcharts from 'highcharts/highstock';
import BlePanelSensorstreamGraph from './BlePanelSensorstreamGraph';

class BlePanelRecordingDisplay extends Component {
  constructor(props) {
    super(props);

    this.generateStartData = this.generateStartData.bind(this);
    this.allOptions = [];
    this.recordingStartTime = Date.now();

    //initialize HighCharts options for the different sensors
    for (const key of Object.keys(this.props.deviceSensors)) {
      this.allOptions.push(
        this.getOptions(
          this.props.deviceSensors[key].parseScheme.map((elm) => elm.name),
          this.props.deviceSensors[key].name
        )
      );
    }
  }

  getOptions(components, name) {
    const recordingStartTime = this.recordingStartTime;
    return {
      chart: {
        type: 'spline',
        animation: false, // don't animate in old IE
        marginRight: 10,
        useSVG: true,
      },
      boost: {
        useGPUTranslations: true,
      },
      series: this.generateStartData(components),
      title: {
        text: name,
      },
      xAxis: {
        min: this.recordingStartTime, // current time
        max: this.recordingStartTime + 30000, // current time + 30s
        type: 'datetime',
        tickPixelInterval: 100,
        labels: {
          enabled: true,
          rotation: 20,
          overflow: 'allow',
          formatter: function () {
            // calculate the time since the recording started in seconds
            const seconds = Math.round(
              (this.value - recordingStartTime) / 1000
            );
            if (seconds < 0) {
              return '';
            }
            return seconds + 's';
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

  generateStartData(components) {
    var all_series = [],
      j;
    var time = Date.now();

    for (let j = -components.length; j < 0; j += 1) {
      all_series.push({
        name: components[j + components.length],
        data: [{ x: this.recordingStartTime, y: 0 }],
        marker: {
          enabled: false,
        },
      });
    }
    return all_series;
  }

  render() {
    return (
      <div className="m-2">
        <div className="header-wrapper d-flex justify-content-flex-start align-content-center">
          <h4>5. Recording</h4>
        </div>
        <div className="body-wrapper">
          <ul>
            {Array.from(this.props.selectedSensors).map((sensorKey) => {
              return (
                <li key={sensorKey}>
                  <BlePanelSensorstreamGraph
                    options={
                      this.allOptions[
                        this.props.sensorKeys.indexOf(sensorKey.toString())
                      ]
                    }
                    fullSampleRate={this.props.fullSampleRate}
                    sampleRate={this.props.deviceSensors[sensorKey].sampleRate}
                    lastData={this.props.lastData}
                    index={this.props.sensorKeys.indexOf(sensorKey.toString())}
                    currentLabel={this.props.currentLabel}
                    prevLabel={this.props.prevLabel}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
}

export default BlePanelRecordingDisplay;
