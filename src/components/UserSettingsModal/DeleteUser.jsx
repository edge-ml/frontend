import React, { Component } from "react";
import { Button, TextInput, Modal } from "@mantine/core";

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
      <section className="user-settings-section">
        <div className="user-settings-section__heading">
          <h4 className="user-settings-section__title">Delete user</h4>
          <p className="user-settings-section__description">
            This permanently removes your account and its projects.
          </p>
        </div>
        <p className="user-settings-danger-copy">
          Type <b>{this.props.userMail}</b> below to confirm. All projects where
          you are an admin will be deleted.
        </p>
        <div className="user-settings-fields">
          <TextInput
            label="Confirmation e-mail"
            type="text"
            id="E-Mail"
            placeholder="E-Mail"
            onChange={this.eMailChanged}
          />
        </div>
        <div className="user-settings-actions">
          <Button
            variant="outline"
            id="buttonDeleteUser"
            color="red"
            disabled={this.state.confirmationMail !== this.props.userMail}
            onClick={this.toggleConfirmationModal}
          >
            Delete user
          </Button>
        </div>
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
          <Modal.Footer
            style={{ display: "flex", justifyContent: "space-between" }}
          >
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
      </section>
    );
  }
}

export default DeleteUser;
