import React, { Component } from 'react';
import { Button, Card, CardHeader, CardBody } from 'reactstrap';
import HelpModal from './HelpModal';
import CreateNewDatasetModal from '../CreateNewDatasetModal/CreateNewDatasetModal';
import { downloadSingleDataset } from '../../services/DatasetService';
import ConfirmationDialogueModal from '../ConfirmationDilaogueModal/ConfirmationDialogueModal';
import './ManagementPanel.css';

class ManagementPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isUploadModalOpen: false,
      isHelpModalOpen: false,
      isDeleteDatasetModalOpen: false,
    };

    this.toggleUploadModal = this.toggleUploadModal.bind(this);
    this.toggleHelpModal = this.toggleHelpModal.bind(this);
    this.downloadDataSet = this.downloadDataSet.bind(this);
    this.onDatasetComplete = this.onDatasetComplete.bind(this);
    this.toggleDeleteDatasetModal = this.toggleDeleteDatasetModal.bind(this);
  }

  onDatasetComplete() {
    this.setState({
      isUploadModalOpen: false,
    });
    this.props.onDatasetComplete();
  }

  toggleUploadModal() {
    this.props.setModalOpen(!this.state.isUploadModalOpen);
    this.setState({ isUploadModalOpen: !this.state.isUploadModalOpen });
  }

  toggleHelpModal() {
    this.props.setModalOpen(!this.state.isHelpModalOpen);
    this.setState({ isHelpModalOpen: !this.state.isHelpModalOpen });
  }

  toggleDeleteDatasetModal() {
    this.props.setModalOpen(!this.state.isDeleteDatasetModalOpen);
    this.setState({
      isDeleteDatasetModalOpen: !this.state.isDeleteDatasetModalOpen,
    });
  }

  downloadDataSet() {
    downloadSingleDataset(
      this.props.dataset,
      this.props.labelings,
      this.props.labels
    );
  }

  render() {
    return (
      <Card>
        <CardHeader>
          <b>Management</b>
        </CardHeader>
        <CardBody>
          <Button
            id="buttonUploadCSV"
            block
            outline
            color="primary"
            onClick={this.toggleUploadModal}
          >
            Upload CSV
          </Button>
          <Button
            id="buttonDownloadDataset"
            block
            outline
            color="primary"
            onClick={this.downloadDataSet}
          >
            Download as CSV
          </Button>
          <Button
            id="buttonDeleteDataset"
            block
            outline
            color="danger"
            onClick={this.toggleDeleteDatasetModal}
          >
            Delete Dataset
          </Button>
          <hr />
          <Button
            id="buttonOpenHelpModal"
            block
            outline
            color="secondary"
            onClick={this.toggleHelpModal}
          >
            Help
          </Button>
        </CardBody>
        <CreateNewDatasetModal
          isOpen={this.state.isUploadModalOpen}
          onCloseModal={this.toggleUploadModal}
          dataset={this.props.dataset}
          onDatasetComplete={this.onDatasetComplete}
        />
        {this.state.isHelpModalOpen ? (
          <HelpModal
            isOpen={this.state.isHelpModalOpen}
            onCloseModal={this.toggleHelpModal}
          />
        ) : null}
        {this.state.isDeleteDatasetModalOpen ? (
          <ConfirmationDialogueModal
            onCancel={this.toggleDeleteDatasetModal}
            onConfirm={this.props.onDeleteDataset}
            confirmString={'Are you sure to delete this dataset?'}
            title={'Confirm Dataset Deletion'}
            isOpen={this.state.isDeleteDatasetModalOpen}
          />
        ) : null}
      </Card>
    );
  }
}
export default ManagementPanel;
