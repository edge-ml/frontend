import React, { Component } from 'react';
import {
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText
} from 'reactstrap';

import { validateEmail } from '../../services/helpers';
import { changeUserName } from '../../services/ApiServices/AuthentificationServices';

class UserNameSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: undefined,
      userNameConfirm: undefined,
      userNameError: undefined
    };

    this.onUserNameChange = this.onUserNameChange.bind(this);
    this.onUserNameConfirmChange = this.onUserNameConfirmChange.bind(this);
    this.onUserNameSubmit = this.onUserNameSubmit.bind(this);
  }

  onUserNameChange(e) {
    this.setState({
      userName: e.target.value,
      userNameError: undefined
    });
  }

  onUserNameConfirmChange(e) {
    this.setState({
      userNameConfirm: e.target.value,
      userNameError: undefined
    });
  }

  onUserNameSubmit() {
    if (!this.state.userName && !this.state.userNameConfirm) return;
    if (this.state.userName !== this.state.userNameConfirm) {
      this.setState({
        userNameError: 'E-mails do not match'
      });
    } else {
      changeUserName(this.state.userName)
        .then(data => window.alert(data))
        .catch(err => {
          this.setState({
            userNameError: err.error
          });
        });
    }
  }

  render() {
    return (
      <div>
        <InputGroup>
          <InputGroupAddon addonType="prepend">
            <InputGroupText>Username</InputGroupText>
          </InputGroupAddon>
          <Input
            id="inputUserName"
            placeholder="New username"
            onChange={this.onUserNameChange}
          />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon addonType="prepend">
            <InputGroupText>Username</InputGroupText>
          </InputGroupAddon>
          <Input
            id="inputUserNameConfirm"
            placeholder="Retype new username"
            onChange={this.onUserNameConfirmChange}
          />
        </InputGroup>
        <Button
          disabled={
            !this.state.userName ||
            this.state.userName !== this.state.userNameConfirm
          }
          id="buttonSaveUserName"
          color="primary"
          className="m-1 mr-auto"
          onClick={this.onUserNameSubmit}
        >
          Save new username
        </Button>
        {this.state.userNameError ? (
          <div
            id="userNameError"
            style={{
              display: 'inline',
              color: 'red',
              marginLeft: '16px'
            }}
          >
            {this.state.userNameError}
          </div>
        ) : null}
      </div>
    );
  }
}

export default UserNameSettings;
