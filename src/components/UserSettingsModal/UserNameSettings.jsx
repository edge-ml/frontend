import React, { Component } from "react";
import { Button, TextInput } from "@mantine/core";

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
      <section className="user-settings-section" id={this.props.id}>
        <div className="user-settings-section__heading">
          <h4 className="user-settings-section__title">Change username</h4>
          <p className="user-settings-section__description">
            Update the name shown across your account.
          </p>
        </div>
        <div className="user-settings-fields">
          <TextInput
            label="Username"
            id="inputUserName"
            placeholder="New username"
            onChange={this.onUserNameChange}
          />
          <TextInput
            label="Confirm username"
            id="inputUserNameConfirm"
            placeholder="Retype new username"
            onChange={this.onUserNameConfirmChange}
          />
        </div>
        <div className="user-settings-actions">
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
            <div id="userNameError" className="user-settings-error">
              {this.state.userNameError}
            </div>
          ) : null}
        </div>
      </section>
    );
  }
}

export default UserNameSettings;
