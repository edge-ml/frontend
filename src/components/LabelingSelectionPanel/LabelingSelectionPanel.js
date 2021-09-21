import React, { Component } from 'react';
import { Card, CardBody, Button } from 'reactstrap';
import './LabelingSelectionPanel.css';

class LabelingSelectionPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uiState: {
        isSticky: false
      }
    };
    this.onScroll = this.onScroll.bind(this);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
  }

  handleLabelingClicked(e, id) {
    e.preventDefault();
    this.props.onSelectedLabelingIdChanged(id);
  }

  onScroll() {
    if (window.pageYOffset > 56) {
      this.setState({ uiState: { isSticky: true } });
    } else if (window.pageYOffset < 56) {
      this.setState({ uiState: { isSticky: false } });
    }
  }

  render() {
    var classNames = require('classnames');

    return (
      <Card
        id="labelingSelectionPanel"
        className={
          !this.state.uiState.isSticky
            ? 'LabelingSelectionPanel'
            : 'StickyLabelingSelectionPanel'
        }
      >
        <CardBody className="text-left p-1">
          {this.props.labelings.map((labeling, index) => (
            <Button
              id="buttonLabeling"
              className={classNames(
                'm-1',
                {
                  'btn-primary':
                    labeling['_id'] === this.props.selectedLabelingId
                },
                {
                  'btn-light': labeling['_id'] !== this.props.selectedLabelingId
                }
              )}
              onClick={e => this.handleLabelingClicked(e, labeling['_id'])}
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
