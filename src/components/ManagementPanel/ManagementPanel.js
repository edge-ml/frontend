import React, { Component } from 'react';
import { Button, Card, CardHeader, CardBody } from 'reactstrap';
import './ManagementPanel.css';
import UploadCsvModal from './UploadCsvModal';

class ManagementPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalOpen: false
    };

    this.toggleModal = this.toggleModal.bind(this);
  }

  toggleModal() {
    this.setState({ isModalOpen: !this.state.isModalOpen });
  }

  render() {
    return (
      <Card>
        <CardHeader>
          <b>Management</b>
        </CardHeader>
        <CardBody>
          <Button block outline color="primary" onClick={this.toggleModal}>
            Upload CSV
          </Button>
          <hr />
          <Button block outline color="primary">
            Download as CSV
          </Button>
          <Button block outline color="danger">
            Delete Dataset
          </Button>
        </CardBody>
        <UploadCsvModal
          isOpen={this.state.isModalOpen}
          onUpload={obj => this.props.onUpload(obj)}
          onCloseModal={this.toggleModal}
        />
      </Card>
    );
  }
}
export default ManagementPanel;
