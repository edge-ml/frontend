import React, { Component } from 'react';
import {
  Button,
  Card,
  InputGroup,
  InputGroupText,
  InputGroupAddon,
  Input
} from 'reactstrap';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

import './TimeSeriesCollectionPanel.css';
import TimeSeriesPanel from '../TimeSeriesPanel/TimeSeriesPanel';

class TimeSeriesCollectionPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timeSeries: this.props.timeSeries,
      labeling: this.props.labeling,
      labelTypes: this.props.labelTypes,
      onLabelClicked: props.onLabelClicked,
      selectedLabelId: props.selectedLabelId,
      start: props.start,
      end: props.end,
      onLabelChanged: props.onLabelChanged
    };
  }

  componentWillReceiveProps(props) {
    this.setState(state => ({
      labeling: props.labeling,
      labelTypes: props.labelTypes,
      timeSeries: props.timeSeries,
      onLabelClicked: props.onLabelClicked,
      selectedLabelId: props.selectedLabelId,
      start: props.start,
      end: props.end,
      onLabelChanged: props.onLabelChanged
    }));
  }

  render() {
    return (
      <div>
        {this.state.timeSeries.map(timeSeries => (
          <TimeSeriesPanel
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
          />
        ))}
      </div>
    );
  }
}
export default TimeSeriesCollectionPanel;
