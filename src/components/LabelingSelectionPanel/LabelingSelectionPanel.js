import React, { Component } from 'react';
import { Card, CardBody, Button } from 'reactstrap';
import './LabelingSelectionPanel.css';
import classNames from 'classnames';

class LabelingSelectionPanel extends Component {
  handleLabelingClicked(e, id) {
    e.preventDefault();
    this.props.onSelectedLabelingIdChanged(id);
  }

  render() {
    return (
      <Card id="labelingSelectionPanel" className="LabelingSelectionPanel">
        <CardBody className="text-left p-1">
          {this.props.labelings.map((labeling, index) => (
            <Button
              id="buttonLabeling"
              className={classNames(
                'm-1',
                {
                  'btn-primary':
                    labeling['_id'] === this.props.selectedLabelingId,
                },
                {
                  'btn-light':
                    labeling['_id'] !== this.props.selectedLabelingId,
                }
              )}
              onClick={(e) => this.handleLabelingClicked(e, labeling['_id'])}
              color={
                labeling['_id'] === this.props.selectedLabelingId
                  ? 'primary'
                  : ''
              }
              key={index}
            >
              {labeling.name + '(' + (index + 1) + ')'}
            </Button>
          ))}
          <Button
            id="buttonAddLabeling"
            className="m-1"
            color="secondary"
            onClick={this.props.onAddLabeling}
          >
            + Add Labeling Set
          </Button>
        </CardBody>
      </Card>
    );
  }
}
export default LabelingSelectionPanel;
