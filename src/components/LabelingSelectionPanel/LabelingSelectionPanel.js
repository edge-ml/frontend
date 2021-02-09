import React, { Component } from 'react';
import { Card, CardBody, Button } from 'reactstrap';
import './LabelingSelectionPanel.css';

class LabelingSelectionPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      objectType: props.objectType,
      labelings: props.labelings,
      selectedLabelingId: props.selectedLabelingId,
      onSelectedLabelingIdChanged: props.onSelectedLabelingIdChanged,
      uiState: {
        isSticky: false
      }
    };

    this.onAddLabeling = this.onAddLabeling.bind(this);
    this.onScroll = this.onScroll.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState(state => ({
      labelings: props.labelings,
      selectedLabelingId: props.selectedLabelingId,
      onSelectedLabelingIdChanged: props.onSelectedLabelingIdChanged
    }));
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
  }

  handleLabelingClicked(e, id) {
    e.preventDefault();
    this.state.onSelectedLabelingIdChanged(id);
  }

  onAddLabeling() {
    console.log('Setting new here');
    this.props.history.push({
      pathname: this.props.history.location.pathname + '/new'
    });
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
          {this.state.labelings.map((labeling, index) => (
            <Button
              className={classNames(
                'm-1',
                {
                  'btn-primary':
                    labeling['_id'] === this.state.selectedLabelingId
                },
                {
                  'btn-light': labeling['_id'] !== this.state.selectedLabelingId
                }
              )}
              onClick={e => this.handleLabelingClicked(e, labeling['_id'])}
              color={
                labeling['_id'] === this.state.selectedLabelingId
                  ? 'primary'
                  : ''
              }
              key={index}
            >
              {labeling.name} {'(' + (index + 1) + ')'}
            </Button>
          ))}
          <Button
            className="m-1"
            color="secondary"
            id="btnAddExperiment"
            onClick={this.props.onAddLabeling}
          >
            + Add
          </Button>
        </CardBody>
      </Card>
    );
  }
}
export default LabelingSelectionPanel;
