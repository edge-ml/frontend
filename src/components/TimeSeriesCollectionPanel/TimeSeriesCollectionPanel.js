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
              : [
                  { timestamp: this.state.start, value: 10 },
                  { timestamp: this.state.end, value: 10 }
                ]
          }
          samplingRate={this.state.timeSeries.samplingRate}
          labeling={this.state.labeling}
          labelTypes={this.state.labelTypes}
          onLabelClicked={this.state.onLabelClicked}
          selectedLabelId={this.state.selectedLabelId}
          start={this.state.timeSeries.start}
          end={this.state.timeSeries.end}
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
            samplingRate={1}
            name={''}
            unit={''}
            labeling={this.state.labeling}
            labelTypes={this.state.labelTypes}
            onLabelClicked={this.state.onLabelClicked}
            selectedLabelId={this.state.selectedLabelId}
            start={this.state.timeSeries.start}
            end={this.state.timeSeries.end}
            onLabelChanged={this.state.onLabelChanged}
            canEdit={this.props.canEdit}
            onScrubbed={this.state.onScrubbed}
            numSeries={2}
            drawingId={this.props.drawingId}
            drawingPosition={this.props.drawingPosition}
            newPosition={this.props.newPosition}
            updateControlStates={this.props.updateControlStates}
            clearDrawingInterval={this.props.clearDrawingInterval}
            drawingInterval={this.props.drawingInterval}
          />
        ) : null}

        {this.state.timeSeries.map((timeSeries, key) => (
          <TimeSeriesPanel
            key={key}
            index={key + 1}
            data={timeSeries.data}
            samplingRate={timeSeries.samplingRate}
            name={timeSeries.name}
            unit={timeSeries.unit}
            labeling={this.state.labeling}
            labelTypes={this.state.labelTypes}
            onLabelClicked={this.state.onLabelClicked}
            selectedLabelId={this.state.selectedLabelId}
            start={this.state.timeSeries.start}
            end={this.state.timeSeries.end}
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
            clearDrawingInterval={this.props.clearDrawingInterval}
            drawingInterval={this.props.drawingInterval}
          />
        ))}
        {this.state.fusedSeries
          .filter(fusedSeries => fusedSeries.timeSeries.length > 0)
          .map((fusedSeries, key) => {
            let selectedSeries = this.state.timeSeries.filter(timeSeries => {
              return (
                fusedSeries.timeSeries.filter(
                  seriesId => seriesId === timeSeries['_id']
                ).length !== 0
              );
            });

            return (
              <TimeSeriesPanel
                key={key}
                fused={true}
                index={key + this.state.timeSeries.length + 1}
                data={selectedSeries.map(series => series.data)}
                samplingRate={selectedSeries.map(series => series.samplingRate)}
                name={selectedSeries.map(series => series.name)}
                unit={selectedSeries.map(series => series.unit)}
                labeling={this.state.labeling}
                labelTypes={this.state.labelTypes}
                onLabelClicked={this.state.onLabelClicked}
                selectedLabelId={this.state.selectedLabelId}
                start={selectedSeries.map(series => series.start)}
                end={selectedSeries.map(series => series.end)}
                onLabelChanged={this.state.onLabelChanged}
                canEdit={this.props.canEdit}
                onScrubbed={this.state.onScrubbed}
                numSeries={
                  this.state.timeSeries.length +
                  this.state.fusedSeries.length +
                  1
                }
                onDelete={() => this.state.onDelete(true, key)}
                drawingId={this.props.drawingId}
                drawingPosition={this.props.drawingPosition}
                newPosition={this.props.newPosition}
                updateControlStates={this.props.updateControlStates}
                clearDrawingInterval={this.props.clearDrawingInterval}
                drawingInterval={this.props.drawingInterval}
              />
            );
          })}
      </div>
    );
  }
}
export default TimeSeriesCollectionPanel;
