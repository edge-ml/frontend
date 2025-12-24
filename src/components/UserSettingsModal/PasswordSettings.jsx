import React, { Component } from "react";
import { Button, Stack, Text, TextInput } from "@mantine/core";

import { changeUserPassword } from "./../../services/ApiServices/AuthentificationServices";

class PasswordSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newPassword: undefined,
      newConfirmationPassword: undefined,
      currentPassword: undefined,
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
      .then((data) => window.alert(data))
      .catch((err) => {
        this.setState({
          passwordError: err.data,
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
          onChange={this.onNewPasswordChange}
        />
        <TextInput
          id="inputNewPasswordConfirm"
          type="password"
          label="Password"
          placeholder="Retype new password"
          onChange={this.onConfirmationPasswordChange}
        />
        <TextInput
          id="inputCurrentPassword"
          type="password"
          label="Password"
          placeholder="Current password"
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
