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
      startPlotId: undefined,
      endPlotId: undefined,
      shiftHandledForPlotId: undefined,
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

    // start a new label
    if ((this.state.startPlotId === undefined || this.state.startPlotId !== this.props.currentLabel.plotId) 
        && this.props.currentLabel.id) {
      console.log('start new label');
      xAxis.addPlotLine({
        value: this.props.currentLabel.start,
        color: this.props.currentLabel.color,
        width: 5,
        id: `labelingStart-${this.props.currentLabel.plotId}`
      });
      if (this.props.prevLabel.id && this.state.endPlotId === undefined) {
        console.log('handle abrupt')
        console.log('prev', this.props.prevLabel)
        xAxis.removePlotBand(`labelingArea-${this.props.prevLabel.plotId}`);
        xAxis.addPlotBand({
          from: this.props.prevLabel.start,
          to: this.props.prevLabel.end,
          color: this.props.prevLabel.color,
          className: 'labelingArea',
          id: `labelingArea-${this.props.prevLabel.plotId}`,
        });
        xAxis.addPlotLine({
          value: this.props.prevLabel.end,
          color: this.props.prevLabel.color,
          width: 5,
          id: `labelingEnd-${this.props.prevLabel.plotId}`
        });
      }
      this.setState({ startPlotId: this.props.currentLabel.plotId, endPlotId: undefined });
    } 
    // stop the label
    else if (this.state.endPlotId === undefined && this.props.currentLabel.end !== undefined) {
      console.log('stop the label')
      for (const pl of xAxis.plotLinesAndBands) {
        console.log(pl);
      }
      this.setState({ endPlotId: this.props.currentLabel.plotId });
      xAxis.removePlotBand(`labelingArea-${this.props.currentLabel.plotId}`);
      xAxis.addPlotBand({
        from: this.props.currentLabel.start,
        to: this.props.currentLabel.end,
        color: this.props.currentLabel.color,
        className: 'labelingArea',
        id: `labelingArea-${this.props.currentLabel.plotId}`,
      });
      xAxis.addPlotLine({
        value: this.props.currentLabel.end,
        color: this.props.currentLabel.color,
        width: 5,
        id: `labelingEnd-${this.props.currentLabel.plotId}`
      });
      console.log('----------')
      for (const pl of xAxis.plotLinesAndBands) {
        console.log(pl);
      }

    } 

    // handle the case when the user starts recording a new label before stopping the previous one
    else if (this.state.startPlotId && this.state.startPlotId !== this.props.currentLabel.plotId && this.state.endPlotId === undefined) {
      console.log('handle abrupt')
      // add plotline and update plotband of previous label
      console.log(this.props.prevLabel);
      xAxis.removePlotBand(`labelingArea-${this.props.prevLabel.plotId}`);
      xAxis.addPlotBand({
        from: this.props.prevLabel.start,
        to: this.props.prevLabel.end,
        color: this.props.prevLabel.color,
        className: 'labelingArea',
        id: `labelingArea-${this.props.prevLabel.plotId}`,
      });
      xAxis.addPlotLine({
        value: this.props.prevLabel.end,
        color: this.props.prevLabel.color,
        width: 5,
        id: `labelingEnd-${this.props.prevLabel.plotId}`
      });
      
      // add plotline of the new label
      xAxis.addPlotLine({
        value: this.props.currentLabel.start,
        color: this.props.currentLabel.color,
        width: 5,
        id: `labelingStart-${this.props.currentLabel.plotId}`
      });
      this.setState({ startPlotId: this.props.currentLabel.plotId });
    }
    // if the graph is not shifting, gradually move the end of the plotband to right each time a new point is rendered
    else if (!shiftSeries && this.state.startPlotId !== undefined && this.state.endPlotId === undefined) {
      console.log('static graph rerender plotband');
      xAxis.removePlotBand(`labelingArea-${this.state.startPlotId}`)
      xAxis.addPlotBand({
        from: this.props.currentLabel.start,
        to: this.props.lastData[this.props.index][0],
        color: this.props.currentLabel.color,
        className: 'labelingArea',
        id: `labelingArea-${this.state.startPlotId}`,
      });
    } 
    // if the graph is shifting, set the end of the plotband to infinity once
    // end of the graph is not visible during recording the label while shifting the graph
    // so we can optimize the number of rendering to just one this way
    else if (shiftSeries && this.state.shiftHandledForPlotId !== this.state.startPlotId) {
      console.log('moving graph, rerender the plotband once by setting the maximum to infinity')
      xAxis.removePlotBand(`labelingArea-${this.state.startPlotId}`)
      xAxis.addPlotBand({
        from: this.props.currentLabel.start,
        to: 4000000000000, // pseudo infinity
        color: this.props.currentLabel.color,
        className: 'labelingArea',
        id: `labelingArea-${this.state.startPlotId}`,
      });
      this.setState({ shiftHandledForPlotId: this.state.startPlotId })
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
