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
      this.interval_length = 100;
      this.datastream_length = Math.floor(
        this.streaming_seconds * (1000 / this.interval_length)
      );
    }

    this.state = {
      liveUpdate: false,
      startPlotId: undefined,
      endPlotId: undefined,
      shiftHandledForPlotId: undefined,
      offsetApplied: undefined,
      labelActive: false,
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
        timestamp = Date.now();
        value = 0;
      }
      var shiftSeries = series.data.length >= this.datastream_length;
      series.addPoint([timestamp, value], true, shiftSeries); // adds new data point and deletes oldest one if max datastream length is reached
    }
    if (shiftSeries) {
      var extremes = chart.xAxis[0].getExtremes();
      chart.xAxis[0].setExtremes(
        extremes.min + this.interval_length,
        extremes.max + this.interval_length
      );
    }

    const offsetAmount = 4 * this.interval_length;
    const visualOffset = shiftSeries ? 0 : offsetAmount;

    // start a new label
    if (
      (this.state.startPlotId === undefined ||
        this.state.startPlotId !== this.props.currentLabel.plotId) &&
      this.props.currentLabel.id
    ) {
      xAxis.addPlotLine({
        value: this.props.currentLabel.start - visualOffset,
        color: this.props.currentLabel.color,
        width: 5,
        id: `labelingStart-${this.props.currentLabel.plotId}`,
      });

      // handle the case when the user starts recording a new label before stopping the previous one
      if (this.props.prevLabel.id && this.state.endPlotId === undefined) {
        xAxis.removePlotBand(`labelingArea-${this.props.prevLabel.plotId}`);
        xAxis.addPlotBand({
          from: this.props.prevLabel.start - visualOffset,
          to: this.props.prevLabel.end - visualOffset,
          color: this.props.prevLabel.color,
          className: 'labelingArea',
          id: `labelingArea-${this.props.prevLabel.plotId}`,
        });
        xAxis.addPlotLine({
          value: this.props.prevLabel.end - visualOffset,
          color: this.props.prevLabel.color,
          width: 5,
          id: `labelingEnd-${this.props.prevLabel.plotId}`,
        });
      }
      this.setState({
        startPlotId: this.props.currentLabel.plotId,
        endPlotId: undefined,
        offsetApplied: !shiftSeries,
        labelActive: true,
      });
    }
    // stop the label
    else if (
      this.state.endPlotId === undefined &&
      this.state.labelActive &&
      this.props.currentLabel.end !== undefined
    ) {
      this.setState({ endPlotId: this.props.currentLabel.plotId });
      xAxis.removePlotBand(`labelingArea-${this.props.currentLabel.plotId}`);
      xAxis.addPlotBand({
        from:
          this.props.currentLabel.start -
          (this.state.offsetApplied ? offsetAmount : 0),
        to:
          this.props.currentLabel.end -
          (this.state.offsetApplied ? offsetAmount : 0),
        color: this.props.currentLabel.color,
        className: 'labelingArea',
        id: `labelingArea-${this.props.currentLabel.plotId}`,
      });
      xAxis.addPlotLine({
        value:
          this.props.currentLabel.end -
          (this.state.offsetApplied ? offsetAmount : 0),
        color: this.props.currentLabel.color,
        width: 5,
        id: `labelingEnd-${this.props.currentLabel.plotId}`,
      });
      this.setState({
        labelActive: false,
      });
    }
    // if the graph is not shifting, gradually move the end of the plotband to right each time a new point is rendered
    else if (
      !shiftSeries &&
      this.state.startPlotId !== undefined &&
      this.state.endPlotId === undefined
    ) {
      xAxis.removePlotBand(`labelingArea-${this.state.startPlotId}`);
      xAxis.addPlotBand({
        from: this.props.currentLabel.start - visualOffset,
        to: this.props.lastData[this.props.index][0] - 0.5 * visualOffset,
        color: this.props.currentLabel.color,
        className: 'labelingArea',
        id: `labelingArea-${this.state.startPlotId}`,
      });
    }
    // if the graph is shifting, set the end of the plotband to infinity once
    // end of the graph is not visible during recording the label while shifting the graph
    // so we can optimize the number of rendering to just one this way
    else if (
      shiftSeries &&
      this.state.labelActive &&
      this.state.shiftHandledForPlotId !== this.state.startPlotId
    ) {
      xAxis.removePlotBand(`labelingArea-${this.state.startPlotId}`);
      xAxis.addPlotBand({
        from:
          this.props.currentLabel.start -
          (this.state.offsetApplied ? offsetAmount : 0),
        to: 4000000000000, // pseudo infinity
        color: this.props.currentLabel.color,
        className: 'labelingArea',
        id: `labelingArea-${this.state.startPlotId}`,
      });
      this.setState({ shiftHandledForPlotId: this.state.startPlotId });
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
      <div className="m-2">
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
