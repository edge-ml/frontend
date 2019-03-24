import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import './InteractionControlPanel.css';

class AddLabelModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      onAddLabel: props.onAddLabel,
      isOpen: props.isVisible
    };

    this.toggle = this.toggle.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState(state => ({
      onAddLabel: props.onAddLabel,
      isOpen: props.toggled
    }));
  }

  toggle() {
    this.setState(state => ({
      onAddLabel: this.state.onAddLabel,
      isOpen: this.state.isOpen
    }));
  }

  render() {
    return (
      <Modal
        isOpen={this.state.isOpen}
        toggle={this.toggle}
        className={this.props.className}
      >
        <ModalHeader toggle={this.toggle}>Modal title</ModalHeader>
        <ModalBody />
        <ModalFooter>
          <Button color="primary" onClick={this.toggle}>
            Do Something
          </Button>{' '}
          <Button color="secondary" onClick={this.toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}
export default AddLabelModal;
