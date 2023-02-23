import React, { Component } from 'react';
import {
  Card,
  CardBody,
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from 'reactstrap';
import Select from 'react-select';
import './LabelingSelectionPanel.css';
import classNames from 'classnames';

import HelpModal from './HelpModal';
import { downloadDatasets } from '../../services/DatasetService';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUnlock } from '@fortawesome/free-solid-svg-icons';

const hideLabelsSymbol = 'hide labels' + Math.floor(Math.random() * 1000);

class LabelingSelectionPanel extends Component {
  constructor() {
    super();
    this.state = {
      isHelpModalOpen: false,
    };

    this.toggleHelpModal = this.toggleHelpModal.bind(this);
    this.downloadDataSet = this.downloadDataSet.bind(this);
  }

  toggleHelpModal() {
    this.setState({ isHelpModalOpen: !this.state.isHelpModalOpen });
  }

  downloadDataSet() {
    downloadDatasets([this.props.dataset._id]);
  }
  handleLabelingClicked(e, id) {
    if (e) e.preventDefault();
    if (id === hideLabelsSymbol) {
      this.props.onHideLabels();
    } else {
      // if labels are hidden, show them again
      if (this.props.hideLabels) {
        this.props.onHideLabels();
      }
      this.props.onSelectedLabelingIdChanged(id);
    }
  }

  render() {
    console.log(this.props);
    return (
      <Card
        id="labelingSelectionPanel"
        className="LabelingSelectionPanel edgeml-border edgeml-fade-one"
      >
        <CardBody className="text-left p-1 d-flex flex-wrap labeling-selection-panel_card-body">
          <div className="labelingSetBox d-flex">
            <Select
              className="m-1"
              placeholder="Labeling"
              value={
                this.props.hideLabels
                  ? { label: 'Select Labeling', value: hideLabelsSymbol }
                  : this.props.selectedLabelingId
                  ? {
                      value: this.props.selectedLabelingId,
                      label:
                        'Labeling: ' +
                        this.props.labelings.find(
                          (x) => x._id === this.props.selectedLabelingId
                        ).name,
                    }
                  : null
              }
              onChange={(x) => this.handleLabelingClicked(null, x.value)}
              options={[
                ...(this.props.hideLabels
                  ? []
                  : [{ label: 'Hide Labels', value: hideLabelsSymbol }]),
                ...this.props.labelings.map((x) => ({
                  value: x._id,
                  label: x.name,
                })),
              ]}
            />
            <Button
              id="buttonAddLabeling"
              className="m-1"
              color="secondary"
              onClick={this.props.onAddLabeling}
            >
              + Add Labeling Set
            </Button>
          </div>
          <div className="managementBox d-flex">
            <Button
              id="buttonDownloadDataset"
              className="m-1"
              color="primary"
              onClick={this.downloadDataSet}
            >
              Download as CSV
            </Button>
            <Button
              id="buttonDeleteDataset"
              className="m-1"
              color="danger"
              onClick={() => {
                if (window.confirm('Are you sure to delete this dataset?')) {
                  this.props.onDeleteDataset();
                }
              }}
            >
              Delete Dataset
            </Button>
            <Button
              id="buttonOpenHelpModal"
              className="m-1"
              color="secondary"
              onClick={this.toggleHelpModal}
            >
              Help
            </Button>
          </div>
        </CardBody>
        <HelpModal
          isOpen={this.state.isHelpModalOpen}
          onCloseModal={this.toggleHelpModal}
        />
      </Card>
    );
  }
}
export default LabelingSelectionPanel;
