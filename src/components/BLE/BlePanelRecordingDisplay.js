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

    this.state = {
      liveUpdate: false
    };

    //initialize HighCharts options for the different sensors
    for (let i = 0; i < Object.keys(this.props.deviceSensors).length; i++) {
      this.allOptions.push(
        this.getOptions(
          this.props.deviceSensors[i].parseScheme.map(elm => elm.name),
          this.props.deviceSensors[i].name,
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
        // chart-level boost when there are more than 2 series in the chart
        useGPUTranslations: true,
        seriesThreshold: 2
      },
      series: this.generateStartData(components, number),
      title: {
        text: name
      },
      xAxis: {
        labels: {
          enabled: false
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
    let diff = Highcharts.charts.length - this.props.selectedSensors.size; //for stopping and restarting
    for (let i = 0; i < diff; i++) {
      var shift = Highcharts.charts.shift(); //HighCharts does not delete 'deleted' charts but leaves an 'undefined' in the chart list
    }
    this.handleStartLiveUpdate();
  }

  componentWillUnmount() {
    this.handleStopLiveUpdate();
  }

  updateLiveData() {
    const setIter = this.props.selectedSensors[Symbol.iterator]();
    var current;
    for (var i = 0; i < Highcharts.charts.length; i++) {
      current = setIter.next().value;
      var chart = Highcharts.charts[i];

      for (var j = 0; j < chart.series.length; j++) {
        var series = chart.series[j];
        var x;
        var y;
        if (Array.isArray(this.props.lastData[current])) {
          x = this.props.lastData[current][0];
          y = this.props.lastData[current][1][j];
        } else {
          x = new Date().getTime();
          y = 0;
        }
        series.addPoint([x, y], true, true);
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
                    options={this.allOptions[sensorKey]}
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
