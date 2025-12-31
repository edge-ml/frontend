import React, { Component } from "react";
import { Button, Stack, Text, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { changeUserName } from "../../services/ApiServices/AuthentificationServices";
import useUserStore from "../../Hooks/useUser";

class UserNameSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: "",
      userNameConfirm: "",
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
        userNameError: "Usernames do not match",
      });
    } else {
      changeUserName(this.state.userName)
        .then((data) => {
          const { user, setUser } = useUserStore.getState();
          const nextUser = {
            ...user,
            ...data,
            userName: data?.userName ?? data?.username ?? user?.userName ?? user?.username,
          };
          setUser(nextUser);
          this.setState({
            userName: "",
            userNameConfirm: "",
          });
          notifications.show({
            color: "green",
            message: "Username updated.",
          });
        })
        .catch((err) => {
          const errorMessage =
            err?.response?.data?.detail ||
            err?.message ||
            "Unable to update username.";
          this.setState({
            userNameError: errorMessage,
          });
        });
    }
  }

  render() {
    return (
      <Stack>
        <TextInput
          id="inputUserName"
          label="Username"
          placeholder="New username"
          value={this.state.userName}
          onChange={this.onUserNameChange}
        />
        <TextInput
          id="inputUserNameConfirm"
          label="Username"
          placeholder="Retype new username"
          value={this.state.userNameConfirm}
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
