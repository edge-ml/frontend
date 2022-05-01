import './BleActivated.css';

import React, { Component } from 'react';
import Highcharts from 'highcharts/highstock';
import BlePanelSensorstreamGraph from './BlePanelSensorstreamGraph';

class BlePanelRecordingDisplay extends Component {
  constructor(props) {
    super(props);

    this.generateStartData = this.generateStartData.bind(this);
    this.allOptions = [];

    //initialize HighCharts options for the different sensors
    for (const key of Object.keys(this.props.deviceSensors)) {
      this.allOptions.push(
        this.getOptions(
          this.props.deviceSensors[key].parseScheme.map(elm => elm.name),
          this.props.deviceSensors[key].name
        )
      );
    }
  }

  getOptions(components, name) {
    return {
      chart: {
        //type: 'spline',
        animation: Highcharts.svg, // don't animate in old IE
        marginRight: 10
      },
      boost: {
        // chart-level boost when there are more than 1 series in the chart
        useGPUTranslations: true,
        seriesThreshold: 1
      },
      series: this.generateStartData(components),
      title: {
        text: name
      },
      xAxis: {
        labels: {
          enabled: true,
          rotation: 20,
          overflow: 'allow'
        }
      },
      yAxis: {
        title: false,
        labels: {
          enabled: true
        }
      }
    };
  }

  generateStartData(components) {
    var all_series = [],
      j;
    var time = new Date().getTime();

    for (let j = -components.length; j < 0; j += 1) {
      all_series.push({
        name: components[j + components.length],
        data: [{ x: time, y: 0 }],
        marker: {
          enabled: false
        }
      });
    }
    return all_series;
  }

  render() {
    return (
      <div>
        <div className="panelHeader">4. Recording</div>
        <div className="panelDivider"></div>
        <ul>
          {Array.from(this.props.selectedSensors).map(sensorKey => {
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
                ></BlePanelSensorstreamGraph>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default BlePanelRecordingDisplay;
