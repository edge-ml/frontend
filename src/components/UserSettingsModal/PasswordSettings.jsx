import React, { Component } from "react";
import { Button, Stack, Text, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { changeUserPassword } from "./../../services/ApiServices/AuthentificationServices";

class PasswordSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newPassword: "",
      newConfirmationPassword: "",
      currentPassword: "",
      passwordError: undefined,
    };
    this.onNewPasswordChange = this.onNewPasswordChange.bind(this);
    this.onConfirmationPasswordChange =
      this.onConfirmationPasswordChange.bind(this);
    this.onCurrentPasswordChanged = this.onCurrentPasswordChanged.bind(this);
    this.onPasswordChangeSubmit = this.onPasswordChangeSubmit.bind(this);
  }

  onNewPasswordChange(e) {
    this.setState({
      newPassword: e.target.value,
      passwordError: undefined,
    });
  }

  onConfirmationPasswordChange(e) {
    this.setState({
      newConfirmationPassword: e.target.value,
      passwordError: undefined,
    });
  }

  onCurrentPasswordChanged(e) {
    this.setState({
      currentPassword: e.target.value,
      passwordError: undefined,
    });
  }

  onPasswordChangeSubmit() {
    if (
      !this.state.newPassword &&
      !this.state.newConfirmationPassword &&
      !this.state.currentPassword
    ) {
      return;
    }
    if (this.state.newPassword !== this.state.newConfirmationPassword) {
      this.setState({
        passwordError: "Passwords do not match",
      });
      return;
    }
    changeUserPassword(this.state.currentPassword, this.state.newPassword)
      .then(() => {
        this.setState({
          currentPassword: "",
          newPassword: "",
          newConfirmationPassword: "",
        });
        notifications.show({
          color: "green",
          message: "Password updated.",
        });
      })
      .catch((err) => {
        const errorMessage =
          err?.response?.data?.detail ||
          err?.message ||
          "Unable to update password.";
        this.setState({
          passwordError: errorMessage,
        });
      });
  }

  render() {
    return (
      <Stack>
        <TextInput
          id="inputNewPassword"
          type="password"
          label="Password"
          placeholder="New password"
          value={this.state.newPassword}
          onChange={this.onNewPasswordChange}
        />
        <TextInput
          id="inputNewPasswordConfirm"
          type="password"
          label="Password"
          placeholder="Retype new password"
          value={this.state.newConfirmationPassword}
          onChange={this.onConfirmationPasswordChange}
        />
        <TextInput
          id="inputCurrentPassword"
          type="password"
          label="Password"
          placeholder="Current password"
          value={this.state.currentPassword}
          onChange={this.onCurrentPasswordChanged}
        />
        <Button
          variant="outline"
          id="buttonSaveNewPassword"
          color="blue"
          disabled={
            !(
              this.state.currentPassword &&
              this.state.newConfirmationPassword &&
              this.state.newPassword
            )
          }
          onClick={this.onPasswordChangeSubmit}
        >
          Save new password
        </Button>
        {this.state.passwordError ? (
          <Text id="passwordError" c="red">
            {this.state.passwordError}
          </Text>
        ) : null}
      </Stack>
    );
  }
}

export default PasswordSettings;
