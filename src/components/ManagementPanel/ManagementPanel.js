import React, { Component } from 'react';
import { Button, Card, CardHeader, CardBody } from 'reactstrap';
import './ManagementPanel.css';
import UploadCsvModal from './UploadCsvModal';
import HelpModal from './HelpModal';

class ManagementPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isUploadModalOpen: false,
      isHelpModalOpen: false
    };

    this.toggleUploadModal = this.toggleUploadModal.bind(this);
    this.toggleHelpModal = this.toggleHelpModal.bind(this);
  }

  toggleUploadModal() {
    this.setState({ isUploadModalOpen: !this.state.isUploadModalOpen });
  }

  toggleHelpModal() {
    this.setState({ isHelpModalOpen: !this.state.isHelpModalOpen });
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
          <Button block outline color="primary">
            Download as CSV
          </Button>
          <Button block outline color="danger">
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
        <UploadCsvModal
          isOpen={this.state.isUploadModalOpen}
          onUpload={obj => this.props.onUpload(obj)}
          onCloseModal={this.toggleUploadModal}
          startTime={this.props.startTime}
        />
        <HelpModal
          isOpen={this.state.isHelpModalOpen}
          onCloseModal={this.toggleHelpModal}
        />
      </Card>
    );
  }
}
export default ManagementPanel;
