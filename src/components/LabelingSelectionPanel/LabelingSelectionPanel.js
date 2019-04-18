import React, { Component } from 'react';
import { Card, CardBody, Button } from 'reactstrap';
import './LabelingSelectionPanel.css';

class LabelingSelectionPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      labelingsDefinition: props.labelingsDefinition,
      selectedLabelingId: props.selectedLabelingId,
      onSelectedLabelingIdChanged: props.onSelectedLabelingIdChanged
    };

    this.onAddLabeling = this.onAddLabeling.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState(state => ({
      labelingsDefinition: props.labelingsDefinition,
      selectedLabelingId: props.selectedLabelingId,
      onSelectedLabelingIdChanged: props.onSelectedLabelingIdChanged
    }));
  }

  handleLabelingClicked(e, id) {
    e.preventDefault();
    this.state.onSelectedLabelingIdChanged(id);
  }

  onAddLabeling() {
    this.props.history.push({
      pathname: '/labelings/new'
    });
  }

  render() {
    var classNames = require('classnames');

    return (
      <Card className="LabelingSelectionPanel">
        <CardBody className="text-left">
          {this.state.labelingsDefinition.map((labeling, key) => (
            <Button
              className={classNames(
                'm-1',
                {
                  'btn-primary': labeling.id === this.state.selectedLabelingId
                },
                { 'btn-light': labeling.id !== this.state.selectedLabelingId }
              )}
              onClick={e => this.handleLabelingClicked(e, labeling.id)}
              color={
                labeling.id === this.state.selectedLabelingId ? 'primary' : ''
              }
              key={key}
            >
              {labeling.name}
            </Button>
          ))}
          <Button
            className="m-1"
            color="secondary"
            onClick={this.onAddLabeling}
          >
            <b>+ Add</b>
          </Button>
        </CardBody>
      </Card>
    );
  }
}
export default LabelingSelectionPanel;
