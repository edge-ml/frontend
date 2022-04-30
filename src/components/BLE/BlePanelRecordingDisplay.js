import './BleActivated.css';

import React, { Component } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

class BlePanelRecordingDisplay extends Component {
  constructor(props) {
    super(props);

    this.handleStartLiveUpdate = this.handleStartLiveUpdate.bind(this);
    this.handleStopLiveUpdate = this.handleStopLiveUpdate.bind(this);
    this.updateLiveData = this.updateLiveData.bind(this);
    this.generateStartSeries = this.generateStartSeries.bind(this);
    this.generateStartData = this.generateStartData.bind(this);

    this.interval_length = 200; // in ms
    this.datastream_length = 20;
    this.allOptions = [];
    this.diff = 0;

    this.state = {
      liveUpdate: false
    };

    //initialize HighCharts options for the different sensors
    for (const key of Object.keys(this.props.deviceSensors)) {
      this.allOptions.push(
        this.getOptions(
          this.props.deviceSensors[key].parseScheme.map(elm => elm.name),
          this.props.deviceSensors[key].name,
          this.datastream_length
        )
      );
    }
  }

  getOptions(components, name, number) {
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
      series: this.generateStartData(components, number),
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

  generateStartSeries(length) {
    // generate an array of 'empty' data
    var data = [],
      time = new Date().getTime(),
      i;

    for (i = -length; i < 0; i += 1) {
      data.push({
        x: time + i * this.interval_length,
        y: 0
      });
    }
    return data;
  }

  generateStartData(components, length) {
    //generate start data for the chart series
    var all_series = [],
      j;

    for (let j = -components.length; j < 0; j += 1) {
      all_series.push({
        name: components[j + components.length],
        data: this.generateStartSeries(length),
        marker: {
          enabled: false
        }
      });
    }

    return all_series;
  }

  componentDidMount() {
    this.diff = Highcharts.charts.length - this.props.selectedSensors.size; //for stopping and restarting: HighCharts does not delete 'deleted' charts but leaves an 'undefined' in the chart list
    this.handleStartLiveUpdate();
  }

  componentWillUnmount() {
    this.handleStopLiveUpdate();
  }

  updateLiveData() {
    const setIter = this.props.selectedSensors[Symbol.iterator]();
    var current;
    const keys = this.props.sensorKeys;
    for (var i = this.diff; i < Highcharts.charts.length; i++) {
      current = setIter.next().value;
      var chart = Highcharts.charts[i];

      for (var j = chart.series.length - 1; j >= 0; j--) {
        var series = chart.series[j];
        var timestamp;
        var value;
        if (
          Array.isArray(this.props.lastData[keys.indexOf(current.toString())])
        ) {
          timestamp = this.props.lastData[keys.indexOf(current.toString())][0];
          value = this.props.lastData[keys.indexOf(current.toString())][1][j];
        } else {
          timestamp = new Date().getTime();
          value = 0;
        }
        series.addPoint([timestamp, value], true, true);
      }
    }
  }

  handleStartLiveUpdate(e) {
    e && e.preventDefault();
    this.setState({
      liveUpdate: window.setInterval(this.updateLiveData, this.interval_length)
    });
  }

  handleStopLiveUpdate(e) {
    e && e.preventDefault();
    window.clearInterval(this.state.liveUpdate);
    this.setState({
      liveUpdate: false
    });
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
                <div>
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={
                      this.allOptions[
                        this.props.sensorKeys.indexOf(sensorKey.toString())
                      ]
                    }
                    updateArgs={[true, true, true]}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
export default BlePanelRecordingDisplay;
