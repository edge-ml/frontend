import React, { Component } from 'react';
import { Card, Button } from 'reactstrap';
import './LabelingSelectionPanel.css';

class LabelingSelectionPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      labelings: props.labelings,
      selectedLabelingId: props.selectedLabelingId
    };
  }

  handleLabelingClicked(e, id) {
    e.preventDefault();
    this.setState(state => ({
      selectedLabelingId: id
    }));
    this.props.onSelectedLabelingIdChanged(id);
  }

  render() {
    var classNames = require('classnames');

    return (
      <Card className="LabelingSelectionPanel">
        <div className="text-left">
          {this.state.labelings.map(labeling => (
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
                labeling.id === this.state.selectedLabelingId ? 'primary' : {}
              }
            >
              {labeling.name}
            </Button>
          ))}
          <Button className="m-1" color="secondary">
            <bold>+ Add</bold>
          </Button>
        </div>
      </Card>
    );
  }
}
export default LabelingSelectionPanel;
