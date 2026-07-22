import React, { Component } from "react";
import {
  Button,
  TextInput,
  Modal,
} from "@mantine/core";

class DeleteUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmationMail: "",
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
        <h4 style={{ fontWeight: 700 }}>Delete User</h4>
        <div>
          <h6>
            Please type <b>{this.props.userMail}</b> to confirm
          </h6>
          <div>All projects where you are admin will be deleted</div>
        </div>
        <TextInput
          label="E-Mail"
          type="text"
          id="E-Mail"
          placeholder="E-Mail"
          onChange={this.eMailChanged}
        />
        <Button
          variant="outline"
          id="buttonDeleteUser"
          color="red"
          style={{ margin: "0.25rem" }}
          disabled={this.state.confirmationMail !== this.props.userMail}
          onClick={this.toggleConfirmationModal}
        >
          Delete user
        </Button>
        <Modal
          opened={this.state.confirmationModalOpen}
          onClose={this.toggleConfirmationModal}
          title="Confirm User Deletion"
        >
          <Modal.Body>
            Are you sure you want to delete your user account? <br />
            When you delete your account, all projects where you are the admin
            will be deleted!
          </Modal.Body>
          <Modal.Footer style={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              color="red"
              onClick={this.deleteUser}
              disabled={this.state.confirmationMail !== this.props.userMail}
            >
              Delete
            </Button>
            <Button color="blue" onClick={this.toggleConfirmationModal}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default DeleteUser;
