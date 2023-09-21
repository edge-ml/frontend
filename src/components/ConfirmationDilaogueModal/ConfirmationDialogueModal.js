import React, { Component } from 'react';
import { Modal, ModalBody, ModalHeader, ModalFooter, Button } from 'reactstrap';
import './ConfirmationDialogueModal.css';

class ConfirmationDialogueModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: this.props.isOpen,
    };
    this.onKeyPressed = this.onKeyPressed.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyPressed, false);
  }

  //important that this is called when modal is not shown! Modal has to be rendered conditionally.
  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyPressed, false);
  }

  onKeyPressed(e) {
    switch (e.key) {
      case 'Escape':
        this.props.onCancel();
        break;
      case 'Enter':
        this.props.onConfirm();
        break;
    }
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
                outline
                color="danger"
                className="m-1"
                onClick={this.props.onConfirm}
              >
                Confirm
              </Button>
              <Button
                outline
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
