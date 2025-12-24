import React, { Component } from "react";
import { Button, Stack, Text, TextInput, Title } from "@mantine/core";

import { changeUserName } from "../../services/ApiServices/AuthentificationServices";

class UserNameSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: undefined,
      userNameConfirm: undefined,
      userNameError: undefined,
    };

    this.onUserNameChange = this.onUserNameChange.bind(this);
    this.onUserNameConfirmChange = this.onUserNameConfirmChange.bind(this);
    this.onUserNameSubmit = this.onUserNameSubmit.bind(this);
  }

  onUserNameChange(e) {
    this.setState({
      userName: e.target.value,
      userNameError: undefined,
    });
  }

  onUserNameConfirmChange(e) {
    this.setState({
      userNameConfirm: e.target.value,
      userNameError: undefined,
    });
  }

  onUserNameSubmit() {
    if (!this.state.userName && !this.state.userNameConfirm) return;
    if (this.state.userName !== this.state.userNameConfirm) {
      this.setState({
        userNameError: "E-mails do not match",
      });
    } else {
      changeUserName(this.state.userName)
        .then((data) => window.alert(data))
        .catch((err) => {
          this.setState({
            userNameError: err.error,
          });
        });
    }
  }

  render() {
    return (
      <Stack>
        <Title order={4}>Change UserName</Title>
        <TextInput
          id="inputUserName"
          label="Username"
          placeholder="New username"
          onChange={this.onUserNameChange}
        />
        <TextInput
          id="inputUserNameConfirm"
          label="Username"
          placeholder="Retype new username"
          onChange={this.onUserNameConfirmChange}
        />
        <Button
          variant="outline"
          disabled={
            !this.state.userName ||
            this.state.userName !== this.state.userNameConfirm
          }
          id="buttonSaveUserName"
          color="blue"
          onClick={this.onUserNameSubmit}
        >
          Save new username
        </Button>
        {this.state.userNameError ? (
          <Text id="userNameError" c="red">
            {this.state.userNameError}
          </Text>
        ) : null}
      </Stack>
    );
  }
}

export default UserNameSettings;
