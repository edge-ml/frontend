import React, { Component } from "react";
import { Button, Stack, Text, TextInput } from "@mantine/core";

import { validateEmail } from "./../../services/helpers";
import { changeUserMail } from "./../../services/ApiServices/AuthentificationServices";

class MailSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newEmail: undefined,
      confirmationEmail: undefined,
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
        .then((data) => window.alert(data))
        .catch((err) => {
          this.setState({
            emailError: err.error,
          });
        });
    }
  }

  render() {
    return (
      <div>
        <Text fw={700} size="lg">
          Change Mail
        </Text>
        <Stack gap="sm">
          <TextInput
            id="inputNewMail"
            label="E-Mail"
            placeholder="New e-mail"
            onChange={this.onNewEmailChange}
          />
          <TextInput
            id="inputNewMailConfirm"
            label="E-Mail"
            placeholder="Retype new e-mail"
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
