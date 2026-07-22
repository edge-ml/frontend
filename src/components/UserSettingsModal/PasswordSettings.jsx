import React, { Component } from "react";
import { Button, PasswordInput } from "@mantine/core";

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
      <div>
        <h4 style={{ fontWeight: 700 }}>Change password</h4>
        <PasswordInput
          label="Password"
          id="inputNewPassword"
          placeholder="New password"
          onChange={this.onNewPasswordChange}
        />
        <PasswordInput
          label="Password"
          id="inputNewPasswordConfirm"
          placeholder="Retype new password"
          onChange={this.onConfirmationPasswordChange}
        />
        <PasswordInput
          label="Password"
          id="inputCurrentPassword"
          placeholder="Current password"
          onChange={this.onCurrentPasswordChanged}
        />
        <Button
          variant="outline"
          id="buttonSaveNewPassword"
          color="blue"
          style={{ margin: "0.25rem" }}
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
          <div
            id="passwordError"
            style={{
              display: "inline",
              color: "red",
              marginLeft: "16px",
            }}
          >
            {this.state.passwordError}
          </div>
        ) : null}
      </div>
    );
  }
}

export default PasswordSettings;
