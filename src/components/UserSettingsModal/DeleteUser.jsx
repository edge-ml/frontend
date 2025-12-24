import React, { Component } from "react";
import { Button, Group, Modal, Stack, Text, TextInput, Title } from "@mantine/core";

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
      <Stack mt="md">
        <Title order={4}>Delete User</Title>
        <Stack gap={4}>
          <Text size="sm">
            Please type <Text component="span" fw={700}>{this.props.userMail}</Text> to confirm
          </Text>
          <Text size="sm">All projects where you are admin will be deleted</Text>
        </Stack>
        <TextInput
          label="E-Mail"
          id="E-Mail"
          placeholder="E-Mail"
          onChange={this.eMailChanged}
        />
        <Button
          variant="outline"
          id="buttonDeleteUser"
          color="red"
          disabled={this.state.confirmationMail !== this.props.userMail}
          onClick={this.toggleConfirmationModal}
        >
          Delete user
        </Button>
        <Modal
          opened={this.state.confirmationModalOpen}
          onClose={this.toggleConfirmationModal}
        >
          <Title order={5}>Confirm User Deletion</Title>
          <Text mt="sm">
            Are you sure you want to delete your user account?
          </Text>
          <Text mt="xs">
            When you delete your account, all projects where you are the admin
            will be deleted!
          </Text>
          <Group justify="space-between" mt="md">
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
          </Group>
        </Modal>
      </Stack>
    );
  }
}

export default DeleteUser;
