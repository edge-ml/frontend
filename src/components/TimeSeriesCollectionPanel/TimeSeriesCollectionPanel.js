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
      onScrubbed: props.onScrubbed,
      onShift: props.onShift,
      onDelete: props.onDelete
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
      onScrubbed: props.onScrubbed,
      onShift: props.onShift,
      onDelete: props.onDelete
    }));
  }

  onCrosshairDrawn(crosshairEvent) {
    //alert("test")
    if (
      Highcharts.charts &&
      Highcharts.charts[0] &&
      Highcharts.charts[0].xAxis[0]
    ) {
      const xAxisValue = Highcharts.charts[0].xAxis[0].toValue(
        crosshairEvent.e.pageX - Highcharts.charts[0].plotBox.x / 2,
        false
      );

      if (!isNaN(xAxisValue)) {
        const difference = xAxisValue - this.state.start;
        this.state.onScrubbed(difference / 1000);
      }
    }
  }

  render() {
    return (
      <div className="TimeSeriesCollectionPanel">
        <TimeSeriesPanel
          index={0}
          data={
            this.state.timeSeries.length > 0
              ? this.state.timeSeries[0].data
              : [[this.state.start, 10], [this.state.end, 10]]
          }
          labeling={this.state.labeling}
          labelTypes={this.state.labelTypes}
          onLabelClicked={this.state.onLabelClicked}
          selectedLabelId={this.state.selectedLabelId}
          start={this.state.start}
          end={this.state.end}
          onLabelChanged={this.state.onLabelChanged}
          canEdit={this.props.canEdit}
          onScrubbed={this.state.onScrubbed}
          numSeries={
            this.state.timeSeries.length + this.state.fusedSeries.length + 1
          }
        />

        {this.state.timeSeries.length === 0 ? (
          <TimeSeriesPanel
            isEmpty={true}
            index={1}
            data={[]}
            name={''}
            unit={''}
            labeling={this.state.labeling}
            labelTypes={this.state.labelTypes}
            onLabelClicked={this.state.onLabelClicked}
            selectedLabelId={this.state.selectedLabelId}
            start={this.state.start}
            end={this.state.end}
            onLabelChanged={this.state.onLabelChanged}
            canEdit={this.props.canEdit}
            onScrubbed={this.state.onScrubbed}
            numSeries={2}
            drawingId={this.props.drawingId}
            drawingPosition={this.props.drawingPosition}
            newPosition={this.props.newPosition}
            updateControlStates={this.props.updateControlStates}
            clearPlayInterval={this.props.clearPlayInterval}
            interval={this.props.interval}
          />
        ) : null}

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
            canEdit={this.props.canEdit}
            onScrubbed={this.state.onScrubbed}
            numSeries={
              this.state.timeSeries.length + this.state.fusedSeries.length + 1
            }
            onShift={timestamp => this.state.onShift(key, timestamp)}
            onDelete={() => this.state.onDelete(false, key)}
            drawingId={this.props.drawingId}
            drawingPosition={this.props.drawingPosition}
            newPosition={this.props.newPosition}
            updateControlStates={this.props.updateControlStates}
            clearPlayInterval={this.props.clearPlayInterval}
            interval={this.props.interval}
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
            canEdit={this.props.canEdit}
            onScrubbed={this.state.onScrubbed}
            numSeries={
              this.state.timeSeries.length + this.state.fusedSeries.length + 1
            }
            onDelete={() => this.state.onDelete(true, key)}
            drawingId={this.props.drawingId}
            drawingPosition={this.props.drawingPosition}
            newPosition={this.props.newPosition}
            updateControlStates={this.props.updateControlStates}
            clearPlayInterval={this.props.clearPlayInterval}
            interval={this.props.interval}
          />
        ))}
      </div>
    );
  }
}
export default TimeSeriesCollectionPanel;
