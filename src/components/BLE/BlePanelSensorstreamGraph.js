import './BleActivated.css';

import React, { Component } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

class BlePanelSensorstreamGraph extends Component {
  constructor(props) {
    super(props);

    this.handleStartLiveUpdate = this.handleStartLiveUpdate.bind(this);
    this.handleStopLiveUpdate = this.handleStopLiveUpdate.bind(this);
    this.updateLiveData = this.updateLiveData.bind(this);
    this.streaming_seconds = 30;

    if (this.props.fullSampleRate) {
      // show sensor stream at full sample rate
      this.interval_length = Math.floor(1000 / this.props.sampleRate); // in ms
      this.datastream_length = this.props.sampleRate * this.streaming_seconds; // how many data points are visible
    } else {
      // show sensor stream at higher sample rate to improve performance (default)
      this.interval_length = 200;
      this.datastream_length = Math.floor(
        this.streaming_seconds * (1000 / this.interval_length)
      );
    }

    this.state = {
      liveUpdate: false,
    };
  }

  componentDidMount() {
    this.highcharts_index = Highcharts.charts.length - 1; // newest chart
    this.handleStartLiveUpdate();
  }

  componentWillUnmount() {
    this.handleStopLiveUpdate();
  }

  updateLiveData() {
    var chart = Highcharts.charts[this.highcharts_index];
    const xAxis = chart.xAxis[0];
    var shift = false;
    for (var i = chart.series.length - 1; i > -1; i--) {
      var series = chart.series[i];
      var timestamp;
      var value;
      if (Array.isArray(this.props.lastData[this.props.index])) {
        timestamp = this.props.lastData[this.props.index][0];
        value = this.props.lastData[this.props.index][1][i];
      } else {
        timestamp = new Date().getTime();
        value = 0;
      }
      var shiftSeries = series.data.length >= this.datastream_length;
      if (shiftSeries) {
        shift = true;
      }
      series.addPoint([timestamp, value], true, shiftSeries); // adds new data point and deletes oldest one
    }
    if (shift) {
      var extremes = chart.xAxis[0].getExtremes();
      chart.xAxis[0].setExtremes(
        extremes.min + this.interval_length,
        extremes.max + this.interval_length
      );
    }
    
    // labeling part
    if (this.props.labelingStart) {
      xAxis.removePlotLine(`labelingStart-${this.props.labelingPlotId}`);
      xAxis.addPlotLine({
        value: this.props.labelingStart,
        color: this.props.labelColor,
        width: 5,
        id: `labelingStart-${this.props.labelingPlotId}`,
      });
    }

    // manually update plotband, highchart does not support updating an existing plotband
    // so we remove existing and add the updated version again ("to" value is updated)
    if (!this.props.labelingEnd) {
      xAxis.removePlotBand(`labelingArea-${this.props.labelingPlotId}`);
      xAxis.addPlotBand({
        from: this.props.labelingStart,
        to: Date.now(),
        color: this.props.labelColor,
        className: "labelingArea",
        id: `labelingArea-${this.props.labelingPlotId}`,
      });
    } else {
      xAxis.removePlotLine(`labelingStart-${this.props.labelingPlotId}`);
      xAxis.addPlotLine({
        value: this.props.labelingStart,
        color: this.props.labelColor,
        width: 5,
        id: `labelingStart-${this.props.labelingPlotId}`,
      });

      xAxis.removePlotLine(`labelingEnd-${this.props.labelingPlotId}`)
      xAxis.addPlotLine({
        value: this.props.labelingEnd,
        color: this.props.labelColor,
        width: 5,
        id: `labelingEnd-${this.props.labelingPlotId}`,
      });

      xAxis.removePlotBand(`labelingArea-${this.props.labelingPlotId}`);
      xAxis.addPlotBand({
        from: this.props.labelingStart,
        to: this.props.labelingEnd,
        color: this.props.labelColor,
        className: "labelingArea",
        id: `labelingArea-${this.props.labelingPlotId}`,
      });
    }

    if (this.props.labelingStart) {
      xAxis.removePlotLine(`labelingStart-${this.props.labelingPlotId}`);
      xAxis.addPlotLine({
        value: this.props.labelingStart,
        color: this.props.labelColor,
        width: 5,
        id: `labelingStart-${this.props.labelingPlotId}`,
      });
    }

    // manually update plotband, highchart does not support updating an existing plotband
    // so we remove existing and add the updated version again ("to" value is updated)
    if (!this.props.labelingEnd) {
      xAxis.removePlotBand(`labelingArea-${this.props.labelingPlotId}`);
      xAxis.addPlotBand({
        from: this.props.labelingStart,
        to: Date.now(),
        color: this.props.labelColor,
        className: "labelingArea",
        id: `labelingArea-${this.props.labelingPlotId}`,
      });
    } else {
      xAxis.removePlotLine(`labelingStart-${this.props.labelingPlotId}`);
      xAxis.addPlotLine({
        value: this.props.labelingStart,
        color: this.props.labelColor,
        width: 5,
        id: `labelingStart-${this.props.labelingPlotId}`,
      });

      xAxis.removePlotLine(`labelingEnd-${this.props.labelingPlotId}`)
      xAxis.addPlotLine({
        value: this.props.labelingEnd,
        color: this.props.labelColor,
        width: 5,
        id: `labelingEnd-${this.props.labelingPlotId}`,
      });

      xAxis.removePlotBand(`labelingArea-${this.props.labelingPlotId}`);
      xAxis.addPlotBand({
        from: this.props.labelingStart,
        to: this.props.labelingEnd,
        color: this.props.labelColor,
        className: "labelingArea",
        id: `labelingArea-${this.props.labelingPlotId}`,
      });
    }

  }

  handleStartLiveUpdate(e) {
    e && e.preventDefault();
    this.setState({
      liveUpdate: window.setInterval(this.updateLiveData, this.interval_length),
    });
  }

  handleStopLiveUpdate(e) {
    e && e.preventDefault();
    window.clearInterval(this.state.liveUpdate);
    this.setState({
      liveUpdate: false,
    });
  }

  render() {
    return (
      <div>
        <HighchartsReact
          highcharts={Highcharts}
          options={this.props.options}
          updateArgs={[true, true, true]}
        />
      </div>
    );
  }
}

export default BlePanelSensorstreamGraph;
