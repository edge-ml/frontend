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
      <section className="user-settings-section" id={this.props.id}>
        <div className="user-settings-section__heading">
          <h4 className="user-settings-section__title">Change password</h4>
          <p className="user-settings-section__description">
            Choose a new password to keep your account secure.
          </p>
        </div>
        <div className="user-settings-fields">
          <PasswordInput
            label="New password"
            id="inputNewPassword"
            placeholder="New password"
            onChange={this.onNewPasswordChange}
          />
          <PasswordInput
            label="Confirm new password"
            id="inputNewPasswordConfirm"
            placeholder="Retype new password"
            onChange={this.onConfirmationPasswordChange}
          />
          <PasswordInput
            label="Current password"
            id="inputCurrentPassword"
            placeholder="Current password"
            onChange={this.onCurrentPasswordChanged}
          />
        </div>
        <div className="user-settings-actions">
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
            <div id="passwordError" className="user-settings-error">
              {this.state.passwordError}
            </div>
          ) : null}
        </div>
      </section>
    );
  }
}

export default PasswordSettings;
