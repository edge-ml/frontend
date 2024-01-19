import React, { Component, useState } from 'react';
import {
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';

class DeleteUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmationMail: '',
      confirmationModalOpen: false,
    };
    this.eMailChanged = this.eMailChanged.bind(this);
    this.toggleConfirmationModal = this.toggleConfirmationModal.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
  }

  eMailChanged(e) {
    this.setState({
      confirmationMail: e.target.value,
    });
  }

  toggleConfirmationModal() {
    this.setState((prevState) => ({
      confirmationModalOpen: !prevState.confirmationModalOpen,
    }));
  }

  deleteUser() {
    this.props.deleteUser(this.state.confirmationMail);
    this.toggleConfirmationModal();
  }

  render() {
    return (
      <div className="mt-3">
        <h4 className="font-weight-bold">Delete User</h4>
        <div>
          <h6>
            Please type <b>{this.props.userMail}</b> to confirm
          </h6>
          <div>All projects where you are admin will be deleted</div>
        </div>
        <InputGroup>
          <InputGroupAddon addonType="prepend">
            <InputGroupText>E-Mail</InputGroupText>
          </InputGroupAddon>
          <Input
            type="text"
            id="E-Mail"
            placeholder="E-Mail"
            onChange={this.eMailChanged}
          />
        </InputGroup>
        <Button
          id="buttonDeleteUser"
          color="danger"
          className="m-1 mr-auto"
          disabled={this.state.confirmationMail !== this.props.userMail}
          onClick={this.toggleConfirmationModal}
        >
          Delete user
        </Button>
        <Modal
          isOpen={this.state.confirmationModalOpen}
          toggle={this.toggleConfirmationModal}
        >
          <ModalHeader toggle={this.toggleConfirmationModal}>
            Confirm User Deletion
          </ModalHeader>
          <ModalBody>
            Are you sure you want to delete your user account? <br />
            When you delete your account, all projects where you are the admin
            will be deleted!
          </ModalBody>
          <ModalFooter className="d-flex justify-content-between">
            <Button
              color="danger"
              onClick={this.deleteUser}
              disabled={this.state.confirmationMail !== this.props.userMail}
            >
              Delete
            </Button>
            <Button color="primary" onClick={this.toggleConfirmationModal}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default DeleteUser;
