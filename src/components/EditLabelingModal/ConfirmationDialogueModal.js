import React, { Component } from 'react';
import { Modal, ModalBody, ModalHeader, ModalFooter, Button } from 'reactstrap';

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
        <Modal isOpen={this.props.isOpen}>
          <ModalHeader>{this.props.title}</ModalHeader>
          <ModalBody>{this.props.confirmString}</ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              className="m-1 mr-auto"
              onClick={this.props.onCancel}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              className="m-1"
              onClick={this.props.onConfirm}
            >
              Confirm
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default ConfirmationDialogueModal;
