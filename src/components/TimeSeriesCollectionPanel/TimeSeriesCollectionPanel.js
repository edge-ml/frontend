import React, { Component } from 'react';

import './TimeSeriesCollectionPanel.css';
import TimeSeriesPanel from '../TimeSeriesPanel/TimeSeriesPanel';
import Highcharts from 'highcharts/highstock';

class TimeSeriesCollectionPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      timeSeries: props.timeSeries,
      previewTimeSeriesData: props.previewTimeSeriesData,
      fusedSeries: props.fusedSeries ? props.fusedSeries : [],
      labeling: this.props.labeling,
      labelTypes: this.props.labelTypes,
      onLabelClicked: props.onLabelClicked,
      selectedLabelId: props.selectedLabelId,
      start: props.start,
      end: props.end,
      onScrubbed: props.onScrubbed,
      onDelete: props.onDelete,
      activeSeries: props.activeSeries,
    };

    this.sortedPreviewTimeSeries = props.previewTimeSeriesData
      .flat()
      .sort((elmA, elmB) => elmA[0] - elmB[0])
      .filter((e, i, a) => e[0] !== (a[i - 1] ? a[i - 1][0] : undefined));

    this.onCrosshairDrawn = this.onCrosshairDrawn.bind(this);

    Highcharts.addEvent(
      Highcharts.Axis,
      'afterDrawCrosshair',
      this.onCrosshairDrawn
    );

    // keep a copy of the last window acquired via afterSetExtremes
    // so that the component doesn't rerender the preview after an
    // update to the component tree. this copy must be kept outside the
    // react state in order not to cause an infinite loop, as highcharts
    // is also calling afterSetExtremes outside react's scope
    this.lastWindow = null;
  }

  componentWillReceiveProps(props) {
    console.log('component update');
    this.setState((state) => ({
      labeling: props.labeling,
      labelTypes: props.labelTypes,
      timeSeries: props.timeSeries,
      previewTimeSeriesData: props.previewTimeSeriesData,
      fusedSeries: props.fusedSeries ? props.fusedSeries : [],
      onLabelClicked: props.onLabelClicked,
      selectedLabelId: props.selectedLabelId,
      start: props.start,
      end: props.end,
      onScrubbed: props.onScrubbed,
      onDelete: props.onDelete,
      activeSeries: props.activeSeries,
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

  onTimeSeriesWindow = async (index, start, end, resolution) => {
    // getDatasetWindow is memoized in dataset.js, so that this doesn't cause excessive requests
    this.lastWindow = await this.props.getDatasetWindow(start, end, resolution);
    return this.lastWindow[index];
  };

  render() {
    return (
      <div className="TimeSeriesCollectionPanel">
        <TimeSeriesPanel
          index={0}
          offset={0}
          data={
            this.state.previewTimeSeriesData.length > 0
              ? this.sortedPreviewTimeSeries
              : [10, 10]
          }
          labeling={this.state.labeling}
          labelTypes={this.state.labelTypes}
          onLabelClicked={this.state.onLabelClicked}
          selectedLabelId={this.state.selectedLabelId}
          start={this.state.start}
          end={this.state.end}
          canEdit={this.props.canEdit}
          onScrubbed={this.state.onScrubbed}
          numSeries={
            this.state.timeSeries.length + this.state.fusedSeries.length + 1
          }
          onClickPosition={this.props.onClickPosition}
          onLabelPositionUpdate={this.props.onLabelPositionUpdate}
        />

        {this.state.timeSeries.length === 0 ? (
          <TimeSeriesPanel
            isEmpty={true}
            index={1}
            offset={0}
            data={[]}
            samplingRate={1}
            name={''}
            unit={''}
            labeling={this.state.labeling}
            labelTypes={this.state.labelTypes}
            onLabelClicked={this.state.onLabelClicked}
            selectedLabelId={this.state.selectedLabelId}
            start={this.state.start}
            end={this.state.end}
            canEdit={this.props.canEdit}
            onScrubbed={this.state.onScrubbed}
            numSeries={2}
            drawingId={this.props.drawingId}
            drawingPosition={this.props.drawingPosition}
            newPosition={this.props.newPosition}
            updateControlStates={this.props.updateControlStates}
            onClickPosition={this.props.onClickPosition}
            onLabelPositionUpdate={this.props.onLabelPositionUpdate}
            onTimeSeriesWindow={this.onTimeSeriesWindow}
          />
        ) : null}
        {this.state.activeSeries
          .map((elm) => this.state.timeSeries.find((ts) => ts._id === elm))
          .map((timeSeries, key) => (
            <TimeSeriesPanel
              key={key}
              index={key + 1}
              offset={timeSeries.offset}
              data={
                this.lastWindow
                  ? this.lastWindow[key]
                  : this.state.previewTimeSeriesData[key]
              }
              samplingRate={
                timeSeries.samplingRate ? timeSeries.samplingRate : 1
              }
              name={timeSeries.name}
              unit={timeSeries.unit}
              labeling={this.state.labeling}
              labelTypes={this.state.labelTypes}
              onLabelClicked={this.state.onLabelClicked}
              selectedLabelId={this.state.selectedLabelId}
              start={this.state.start}
              end={this.state.end}
              canEdit={this.props.canEdit}
              onScrubbed={this.state.onScrubbed}
              numSeries={
                this.state.timeSeries.length + this.state.fusedSeries.length + 1
              }
              onDelete={() => this.state.onDelete(false, key)}
              drawingId={this.props.drawingId}
              drawingPosition={this.props.drawingPosition}
              newPosition={this.props.newPosition}
              updateControlStates={this.props.updateControlStates}
              onClickPosition={this.props.onClickPosition}
              onLabelPositionUpdate={this.props.onLabelPositionUpdate}
              onTimeSeriesWindow={this.onTimeSeriesWindow}
            />
          ))}
        {this.state.fusedSeries
          .filter((fusedSeries) => fusedSeries.timeSeries.length > 0)
          .map((fusedSeries, key) => {
            let selectedSeries = this.state.timeSeries.filter((timeSeries) => {
              return (
                fusedSeries.timeSeries.filter(
                  (seriesId) => seriesId === timeSeries['_id']
                ).length !== 0
              );
            });

            return (
              <TimeSeriesPanel
                key={key}
                fused={true}
                index={key + this.state.timeSeries.length + 1}
                offset={selectedSeries.map((series) => series.offset)}
                // data={selectedSeries.map(series => series.data)}
                data={[]}
                samplingRate={selectedSeries.map(
                  (series) => series.samplingRate
                )}
                name={selectedSeries.map((series) => series.name)}
                unit={selectedSeries.map((series) => series.unit)}
                labeling={this.state.labeling}
                labelTypes={this.state.labelTypes}
                onLabelClicked={this.state.onLabelClicked}
                selectedLabelId={this.state.selectedLabelId}
                start={this.state.start}
                end={this.state.end}
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
                onClickPosition={this.props.onClickPosition}
                onLabelPositionUpdate={this.props.onLabelPositionUpdate}
                onTimeSeriesWindow={this.onTimeSeriesWindow}
              />
            );
          })}
      </div>
    );
  }
}
export default TimeSeriesCollectionPanel;
