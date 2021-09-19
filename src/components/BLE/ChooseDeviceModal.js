import React, { Component } from 'react';
import classnames from 'classnames';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Table,
  InputGroup,
  InputGroupAddon,
  InputGroupText
} from 'reactstrap';

class CreateNewDatasetModal extends Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.onCloseModal = this.onCloseModal.bind(this);
  }

  componentDidMount() {
    console.log(navigator);
  }

  onCloseModal() {
    this.props.onClose();
  }

  render() {
    if (!this.props.isOpen) {
      return null;
    }
    return (
      <Modal className="modal-xl" isOpen={this.props.isOpen}>
        <ModalHeader>Chhose BLE device</ModalHeader>
        <ModalBody></ModalBody>
        <ModalFooter>
          <Button
            id="cancelButton"
            olor="secondary"
            className="m-1"
            onClick={this.onCloseModal}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default CreateNewDatasetModal;
