import React, { Component } from 'react';

import './TimeSeriesCollectionPanel.css';
import TimeSeriesPanel from '../TimeSeriesPanel/TimeSeriesPanel';

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
      canEdit: props.canEdit
    };
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
      canEdit: props.canEdit
    }));
  }

  render() {
    return (
      <div>
        {this.state.timeSeries.map((timeSeries, key) => (
          <TimeSeriesPanel
            key={key}
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
          />
        ))}
        {this.state.fusedSeries.map((fusedSeries, key) => (
          <TimeSeriesPanel
            key={key}
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
            unit={''}
            labeling={this.state.labeling}
            labelTypes={this.state.labelTypes}
            onLabelClicked={this.state.onLabelClicked}
            selectedLabelId={this.state.selectedLabelId}
            start={this.state.start}
            end={this.state.end}
            onLabelChanged={this.state.onLabelChanged}
            canEdit={this.state.canEdit}
          />
        ))}
      </div>
    );
  }
}
export default TimeSeriesCollectionPanel;
