import React, { Component } from 'react';
import { Modal, ModalBody, ModalHeader, ModalFooter, Button } from 'reactstrap';
import './ConfirmationDialogueModal.css';

class ConfirmationDialogueModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: this.props.isOpen,
    };
  }
  render() {
    return (
      <div>
        <Modal
          isOpen={this.props.isOpen}
          className="modal-body-scrollable modal-l"
        >
          <ModalHeader>{this.props.title}</ModalHeader>
          <ModalBody className="modal-scrollableBody">
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {this.props.confirmString}
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="d-flex flex-row justify-content-end">
              <Button
                color="danger"
                className="m-1"
                onClick={this.props.onConfirm}
              >
                Confirm
              </Button>
              <Button
                color="secondary"
                className="m-1 mr-auto"
                onClick={this.props.onCancel}
              >
                Cancel
              </Button>
            </div>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default ConfirmationDialogueModal;
