import React, { Component } from 'react';
import {
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText
} from 'reactstrap';

import { changeUserPassword } from './../../services/ApiServices/AuthentificationServices';

class PasswordSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newPassword: undefined,
      newConfirmationPassword: undefined,
      currentPassword: undefined,
      passwordError: undefined
    };
    this.onNewPasswordChange = this.onNewPasswordChange.bind(this);
    this.onConfirmationPasswordChange = this.onConfirmationPasswordChange.bind(
      this
    );
    this.onCurrentPasswordChanged = this.onCurrentPasswordChanged.bind(this);
    this.onPasswordChangeSubmit = this.onPasswordChangeSubmit.bind(this);
  }

  onNewPasswordChange(e) {
    this.setState({
      newPassword: e.target.value,
      passwordError: undefined
    });
  }

  onConfirmationPasswordChange(e) {
    this.setState({
      newConfirmationPassword: e.target.value,
      passwordError: undefined
    });
  }

  onCurrentPasswordChanged(e) {
    this.setState({
      currentPassword: e.target.value,
      passwordError: undefined
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
        passwordError: 'Passwords do not match'
      });
      return;
    }
    changeUserPassword(this.state.currentPassword, this.state.newPassword)
      .then(data => window.alert(data))
      .catch(err => {
        this.setState({
          passwordError: err.data
        });
      });
  }

  render() {
    return (
      <div>
        <InputGroup>
          <InputGroupAddon addonType="prepend">
            <InputGroupText>Password</InputGroupText>
          </InputGroupAddon>
          <Input
            id="inputNewPassword"
            type="password"
            placeholder="New password"
            onChange={this.onNewPasswordChange}
          />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon addonType="prepend">
            <InputGroupText>Password</InputGroupText>
          </InputGroupAddon>
          <Input
            id="inputNewPasswordConfirm"
            type="password"
            placeholder="Retype new password"
            onChange={this.onConfirmationPasswordChange}
          />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon addonType="prepend">
            <InputGroupText>Password</InputGroupText>
          </InputGroupAddon>
          <Input
            id="inputCurrentPassword"
            type="password"
            placeholder="Current password"
            onChange={this.onCurrentPasswordChanged}
          />
        </InputGroup>
        <Button
          id="buttonSaveNewPassword"
          color="primary"
          className="m-1 mr-auto"
          onClick={this.onPasswordChangeSubmit}
        >
          Save new password
        </Button>
        {this.state.passwordError ? (
          <div
            id="passwordError"
            style={{
              display: 'inline',
              color: 'red',
              marginLeft: '16px'
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
