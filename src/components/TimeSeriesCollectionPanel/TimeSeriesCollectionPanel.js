import React, { Component } from 'react';

import './TimeSeriesCollectionPanel.css';
import TimeSeriesPanel from '../TimeSeriesPanel/TimeSeriesPanel';
import Highcharts from 'highcharts/highstock';

class TimeSeriesCollectionPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timeSeries: props.timeSeries,
      fusedSeries: props.fusedSeries ? props.fusedSeries : [],
      labeling: this.props.labeling,
      labelTypes: this.props.labelTypes,
      onLabelClicked: props.onLabelClicked,
      selectedLabelId: props.selectedLabelId,
      start: props.start,
      end: props.end,
      onLabelChanged: props.onLabelChanged,
      canEdit: props.canEdit,
      onScrubbed: props.onScrubbed
    };

    this.onCrosshairDrawn = this.onCrosshairDrawn.bind(this);

    Highcharts.addEvent(
      Highcharts.Axis,
      'afterDrawCrosshair',
      this.onCrosshairDrawn
    );
  }

  componentWillReceiveProps(props) {
    this.setState(state => ({
      labeling: props.labeling,
      labelTypes: props.labelTypes,
      timeSeries: props.timeSeries,
      fusedSeries: props.fusedSeries ? props.fusedSeries : [],
      onLabelClicked: props.onLabelClicked,
      selectedLabelId: props.selectedLabelId,
      start: props.start,
      end: props.end,
      onLabelChanged: props.onLabelChanged,
      canEdit: props.canEdit,
      onScrubbed: props.onScrubbed
    }));
  }

  onCrosshairDrawn(crosshairEvent) {
    //alert("test")
    const xAxisValue = Highcharts.charts[0].xAxis[0].toValue(
      crosshairEvent.e.pageX - Highcharts.charts[0].plotBox.x / 2,
      false
    );
    const difference = xAxisValue - this.state.start;
    //console.log(difference / 1000)
    this.state.onScrubbed(difference / 1000);
  }

  render() {
    return (
      <div className="TimeSeriesCollectionPanel">
        <TimeSeriesPanel
          index={0}
          data={this.state.timeSeries[0].data}
          name={this.state.timeSeries[0].name}
          unit={this.state.timeSeries[0].unit}
          labeling={this.state.labeling}
          labelTypes={this.state.labelTypes}
          onLabelClicked={this.state.onLabelClicked}
          selectedLabelId={this.state.selectedLabelId}
          start={this.state.start}
          end={this.state.end}
          onLabelChanged={this.state.onLabelChanged}
          canEdit={this.state.canEdit}
          onScrubbed={this.state.onScrubbed}
          numSeries={
            this.state.timeSeries.length + this.state.fusedSeries.length + 1
          }
        />
        {this.state.timeSeries.map((timeSeries, key) => (
          <TimeSeriesPanel
            index={key + 1}
            data={timeSeries.data}
            name={timeSeries.name}
            unit={timeSeries.unit}
            labeling={this.state.labeling}
            labelTypes={this.state.labelTypes}
            onLabelClicked={this.state.onLabelClicked}
            selectedLabelId={this.state.selectedLabelId}
            start={this.state.start}
            end={this.state.end}
            onLabelChanged={this.state.onLabelChanged}
            canEdit={this.state.canEdit}
            onScrubbed={this.state.onScrubbed}
            numSeries={
              this.state.timeSeries.length + this.state.fusedSeries.length + 1
            }
          />
        ))}
        {this.state.fusedSeries.map((fusedSeries, key) => (
          <TimeSeriesPanel
            fused={true}
            index={key + this.state.timeSeries.length + 1}
            data={this.state.timeSeries
              .filter(timeSeries => {
                return (
                  fusedSeries.series.filter(
                    seriesId => seriesId === timeSeries.id
                  ).length !== 0
                );
              })
              .map(series => series.data)}
            name={this.state.timeSeries
              .filter(timeSeries => {
                return (
                  fusedSeries.series.filter(
                    seriesId => seriesId === timeSeries.id
                  ).length !== 0
                );
              })
              .map(series => series.name)}
            unit={this.state.timeSeries
              .filter(timeSeries => {
                return (
                  fusedSeries.series.filter(
                    seriesId => seriesId === timeSeries.id
                  ).length !== 0
                );
              })
              .map(series => series.unit)}
            labeling={this.state.labeling}
            labelTypes={this.state.labelTypes}
            onLabelClicked={this.state.onLabelClicked}
            selectedLabelId={this.state.selectedLabelId}
            start={this.state.start}
            end={this.state.end}
            onLabelChanged={this.state.onLabelChanged}
            canEdit={this.state.canEdit}
            onScrubbed={this.state.onScrubbed}
            numSeries={
              this.state.timeSeries.length + this.state.fusedSeries.length + 1
            }
          />
        ))}
      </div>
    );
  }
}
export default TimeSeriesCollectionPanel;
