import React, { Component } from "react";
import { Button, TextInput } from "@mantine/core";

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
      <section className="user-settings-section" id={this.props.id}>
        <div className="user-settings-section__heading">
          <h4 className="user-settings-section__title">Change email</h4>
          <p className="user-settings-section__description">
            Update the email address associated with your account.
          </p>
        </div>
        <div className="user-settings-fields">
          <TextInput
            label="E-Mail"
            id="inputNewMail"
            placeholder="New e-mail"
            onChange={this.onNewEmailChange}
          />
          <TextInput
            label="Confirm e-mail"
            id="inputNewMailConfirm"
            placeholder="Retype new e-mail"
            onChange={this.onConfirmationEmailChange}
          />
        </div>
        <div className="user-settings-actions">
          <Button
            variant="outline"
            id="buttonSaveNewMail"
            disabled={
              !this.state.newEmail ||
              this.state.newEmail !== this.state.confirmationEmail
            }
            color="blue"
            onClick={this.onEmailChangeSubmit}
          >
            Save new e-mail
          </Button>
          {this.state.emailError ? (
            <div id="emailError" className="user-settings-error">
              {this.state.emailError}
            </div>
          ) : null}
        </div>
      </section>
    );
  }
}

export default MailSettings;
