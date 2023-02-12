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
import { downloadSingleDataset } from '../../services/DatasetService';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUnlock } from '@fortawesome/free-solid-svg-icons';

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
    downloadSingleDataset(
      this.props.dataset,
      this.props.labelings,
      this.props.labels
    );
  }

  handleLabelingClicked(e, id) {
    if (e) e.preventDefault();
    this.props.onSelectedLabelingIdChanged(id);
  }

  render() {
    console.log(this.props);
    return (
      <Card id="labelingSelectionPanel" className="LabelingSelectionPanel">
        <CardBody className="text-left p-1 d-flex labeling-selection-panel_card-body">
          <Button
            disabled={this.props.isCrosshairIntervalActive}
            className="m-1 btn-light"
            onClick={this.toggleEdit}
          >
            <FontAwesomeIcon
              style={{ color: !this.props.canEdit ? '#b71c1c' : '#43A047' }}
              icon={!this.props.canEdit ? faLock : faUnlock}
              className="mr-2"
            />
            <span
              style={{ color: !this.props.canEdit ? '#b71c1c' : '#43A047' }}
            >
              {!this.props.canEdit ? 'Locked' : 'Unlocked'}
            </span>
          </Button>
          <Button
            className="m-1 btn-light"
            onClick={this.props.onHideLabels}
            style={{ minWidth: 120 }}
          >
            <span
              style={{ color: !this.props.hideLabels ? '#007BFF' : 'gray' }}
            >
              {!this.props.hideLabels ? 'Show labels' : 'Hide labels'}
            </span>
          </Button>
          <Select
            className="m-1"
            placeholder="Labeling"
            value={
              this.props.selectedLabelingId
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
            options={this.props.labelings.map((x) => ({
              value: x._id,
              label: x.name,
            }))}
          />
          <Button
            id="buttonAddLabeling"
            className="m-1"
            color="secondary"
            onClick={this.props.onAddLabeling}
          >
            + Add Labeling Set
          </Button>
          <Button
            id="buttonDownloadDataset"
            className="m-1 ml-auto"
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
