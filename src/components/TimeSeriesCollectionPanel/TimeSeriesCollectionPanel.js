import React, { Component } from 'react';

import './TimeSeriesCollectionPanel.css';
import TimeSeriesPanel from '../TimeSeriesPanel/TimeSeriesPanel';
import Highcharts from 'highcharts/highstock';
import RangeSlider from '../RangeSlider/RangeSlider';

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

    // this.sortedPreviewTimeSeries = props.previewTimeSeriesData
    //   .flat()
    //   .sort((elmA, elmB) => elmA[0] - elmB[0])
    //   .filter((e, i, a) => e[0] !== (a[i - 1] ? a[i - 1][0] : undefined));

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

  getIndexData = () => {
    const N = 1000;
    const start = this.props.datasetStart;
    const end = this.props.datasetEnd;
    const step = (end - start) / (N - 1);
    const arr = Array.from({ length: N }, (_, i) => [start + i * step, -1]);
    return arr;
  };
  render() {
    return (
      <div className="d-flex flex-column">
        {this.state.activeSeries.length ? (
          <div className="d-flex flex-row justify-content-center w-100">
            <div className="navigator">
              <TimeSeriesPanel
                index={0}
                offset={0}
                // data={
                //   this.state.previewTimeSeriesData.length > 0
                //     ? this.sortedPreviewTimeSeries
                //     : [10, 10]
                // }
                // data={[[this.state.start, 1], [this.state.end, 1]]}
                data={this.getIndexData()}
                labeling={this.state.labeling}
                labelTypes={this.state.labelTypes}
                onLabelClicked={this.state.onLabelClicked}
                selectedLabelId={this.state.selectedLabelId}
                start={this.state.start}
                end={this.state.end}
                canEdit={this.props.canEdit}
                onScrubbed={this.state.onScrubbed}
                numSeries={this.state.activeSeries.length + 1}
                onClickPosition={this.props.onClickPosition}
                onLabelPositionUpdate={this.props.onLabelPositionUpdate}
                onTimeSeriesWindow={(start, end, res) =>
                  this.onTimeSeriesWindow(0, start, end, res)
                }
              />
            </div>
          </div>
        ) : (
          <div className="user-info-select-timeSeries">
            Select some time-series on the panel on the right
          </div>
        )}
        <div className="TimeSeriesCollectionPanel">
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
              onTimeSeriesWindow={(start, end, res) =>
                this.onTimeSeriesWindow(0, start, end, res)
              }
            />
          ) : null}
          {this.state.activeSeries.map((elm, key) => {
            const timeSeries = this.state.timeSeries.find(
              (ts) => ts._id === elm
            );
            return (
              <TimeSeriesPanel
                key={key}
                index={key + 1}
                offset={timeSeries.offset}
                data={
                  this.state.previewTimeSeriesData
                    ? this.state.previewTimeSeriesData[key]
                    : []
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
                  this.state.timeSeries.length +
                  this.state.fusedSeries.length +
                  1
                }
                onDelete={() => this.state.onDelete(false, key)}
                drawingId={this.props.drawingId}
                drawingPosition={this.props.drawingPosition}
                newPosition={this.props.newPosition}
                updateControlStates={this.props.updateControlStates}
                onClickPosition={this.props.onClickPosition}
                onLabelPositionUpdate={this.props.onLabelPositionUpdate}
                onTimeSeriesWindow={(start, end, res) =>
                  this.onTimeSeriesWindow(key, start, end, res)
                }
              />
            );
          })}
        </div>
      </div>
    );
  }
}
export default TimeSeriesCollectionPanel;
