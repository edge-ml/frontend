import React, { Component } from "react";
import { Button, Stack, Text, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { validateEmail } from "./../../services/helpers";
import { changeUserMail } from "./../../services/ApiServices/AuthentificationServices";
import useUserStore from "../../Hooks/useUser";

class MailSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newEmail: "",
      confirmationEmail: "",
      emailError: undefined,
    };
    this.onNewEmailChange = this.onNewEmailChange.bind(this);
    this.onConfirmationEmailChange = this.onConfirmationEmailChange.bind(this);
    this.onEmailChangeSubmit = this.onEmailChangeSubmit.bind(this);
  }

  onNewEmailChange(e) {
    this.setState({
      emailError: undefined,
      newEmail: e.target.value,
    });
  }
  onConfirmationEmailChange(e) {
    this.setState({
      emailError: undefined,
      confirmationEmail: e.target.value,
    });
  }

  onEmailChangeSubmit() {
    if (!this.state.newEmail && !this.state.confirmationEmail) return;
    if (this.state.newEmail !== this.state.confirmationEmail) {
      this.setState({
        emailError: "E-mails do not match",
      });
    } else if (!validateEmail(this.state.newEmail)) {
      this.setState({
        emailError: "Not a valid e-mail format",
      });
    } else {
      changeUserMail(this.state.newEmail)
        .then((data) => {
          const { user, setUser } = useUserStore.getState();
          const nextUser = {
            ...user,
            ...data,
            userName: data?.userName ?? data?.username ?? user?.userName ?? user?.username,
          };
          setUser(nextUser);
          this.setState({
            newEmail: "",
            confirmationEmail: "",
          });
          notifications.show({
            color: "green",
            message: "E-mail updated.",
          });
        })
        .catch((err) => {
          const errorMessage =
            err?.response?.data?.detail ||
            err?.message ||
            "Unable to update e-mail.";
          this.setState({
            emailError: errorMessage,
          });
        });
    }
  }

  render() {
    return (
      <div>
        <Stack gap="sm">
          <TextInput
            id="inputNewMail"
            label="E-Mail"
            placeholder="New e-mail"
            value={this.state.newEmail}
            onChange={this.onNewEmailChange}
          />
          <TextInput
            id="inputNewMailConfirm"
            label="E-Mail"
            placeholder="Retype new e-mail"
            value={this.state.confirmationEmail}
            onChange={this.onConfirmationEmailChange}
          />
          <Button
            id="buttonSaveNewMail"
            variant="outline"
            disabled={
              !this.state.newEmail ||
              this.state.newEmail !== this.state.confirmationEmail
            }
            onClick={this.onEmailChangeSubmit}
          >
            Save new e-mail
          </Button>
          {this.state.emailError ? (
            <Text id="emailError" c="red">
              {this.state.emailError}
            </Text>
          ) : null}
        </Stack>
      </div>
    );
  }
}

export default MailSettings;
