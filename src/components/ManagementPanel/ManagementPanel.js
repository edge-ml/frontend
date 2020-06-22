import React, { Component } from 'react';
import { Button, Card, CardHeader, CardBody } from 'reactstrap';
import './ManagementPanel.css';
import UploadCsvModal from './UploadCsvModal';
import HelpModal from './HelpModal';
import CreateNewDatasetModal from '../CreateNewDatasetModal/CreateNewDatasetModal';

class ManagementPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isUploadModalOpen: false,
      isHelpModalOpen: false
    };

    this.toggleUploadModal = this.toggleUploadModal.bind(this);
    this.toggleHelpModal = this.toggleHelpModal.bind(this);
    this.downloadDataSet = this.downloadDataSet.bind(this);
  }

  toggleUploadModal() {
    this.setState({ isUploadModalOpen: !this.state.isUploadModalOpen });
  }

  toggleHelpModal() {
    this.setState({ isHelpModalOpen: !this.state.isHelpModalOpen });
  }

  async downloadDataSet() {
    const fileName = this.props.dataset['_id'];
    const json = JSON.stringify(this.props.dataset, undefined, 4);
    const blob = new Blob([json], { type: 'application/json' });
    const href = await URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = fileName + '.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  render() {
    return (
      <Card>
        <CardHeader>
          <b>Management</b>
        </CardHeader>
        <CardBody>
          <Button
            block
            outline
            color="primary"
            onClick={this.toggleUploadModal}
          >
            Upload CSV
          </Button>
          <hr />
          <Button block outline color="primary" onClick={this.downloadDataSet}>
            Download as JSON
          </Button>
          <Button
            block
            outline
            color="danger"
            onClick={() => {
              if (window.confirm('Are you sure to delete this dataset?')) {
                this.props.onDeleteDataset();
              }
            }}
          >
            Delete Dataset
          </Button>
          <hr />
          <Button
            block
            outline
            color="secondary"
            onClick={this.toggleHelpModal}
          >
            Help
          </Button>
        </CardBody>
        {/*<UploadCsvModal
          isOpen={this.state.isUploadModalOpen}
          onUpload={obj => this.props.onUpload(obj)}
          onCloseModal={this.toggleUploadModal}
          startTime={this.props.startTime}
        />*/}
        <CreateNewDatasetModal
          isOpen={this.state.isUploadModalOpen}
          onCloseModal={this.toggleUploadModal}
          dataset={this.props.dataset}
          accessToken={this.props.accessToken}
        >
          />
        </CreateNewDatasetModal>
        <HelpModal
          isOpen={this.state.isHelpModalOpen}
          onCloseModal={this.toggleHelpModal}
        />
      </Card>
    );
  }
}
export default ManagementPanel;
