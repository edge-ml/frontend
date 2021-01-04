import React, { Component } from 'react';
import {
  Modal,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  NavItem,
  NavLink,
  Nav,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText
} from 'reactstrap';
import classnames from 'classnames';
import {
  changeUserMail,
  changeUserPassword
} from '../../services/ApiServices/AuthentificationServices';
import { validateEmail } from '../../services/helpers';

class UserSettingsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newEmail: undefined,
      confirmationEmail: undefined,
      emailError: undefined,
      activeTab: 'mailChange',
      newPassword: undefined,
      newConfirmationPassword: undefined,
      currentPassword: undefined,
      passwordError: undefined
    };
    this.baseState = this.state;
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onNewEmailChange = this.onNewEmailChange.bind(this);
    this.onConfirmationEmailChange = this.onConfirmationEmailChange.bind(this);
    this.toggleTab = this.toggleTab.bind(this);
    this.onNewPasswordChange = this.onNewPasswordChange.bind(this);
    this.onConfirmationPasswordChange = this.onConfirmationPasswordChange.bind(
      this
    );
    this.onCurrentPasswordChanged = this.onCurrentPasswordChanged.bind(this);
    this.onEmailChangeSubmit = this.onEmailChangeSubmit.bind(this);
    this.onPasswordChangeSubmit = this.onPasswordChangeSubmit.bind(this);
  }

  toggleTab(e) {
    if (e === 'mailChange') {
      this.setState({
        passwordError: undefined,
        currentPassword: undefined,
        newConfirmationPassword: undefined,
        newPassword: undefined,
        activeTab: e
      });
    } else if (e === 'passwordChange') {
      this.setState({
        newEmail: undefined,
        confirmationEmail: undefined,
        emailError: undefined,
        activeTab: e
      });
    }
  }

  onCloseModal() {
    this.setState(this.baseState);
    this.props.onClose();
  }

  onNewEmailChange(e) {
    this.setState({
      newEmail: e.target.value
    });
  }
  onConfirmationEmailChange(e) {
    this.setState({
      confirmationEmail: e.target.value
    });
  }

  onNewPasswordChange(e) {
    this.setState({
      newPassword: e.target.value
    });
  }

  onConfirmationPasswordChange(e) {
    this.setState({
      newConfirmationPassword: e.target.value
    });
  }

  onCurrentPasswordChanged(e) {
    this.setState({
      currentPassword: e.target.value
    });
  }

  onEmailChangeSubmit() {
    if (!this.state.newEmail && !this.state.confirmationEmail) return;
    if (this.state.newEmail !== this.state.confirmationEmail) {
      this.setState({
        emailError: 'E-mails do not match'
      });
    } else if (!validateEmail(this.state.newEmail)) {
      this.setState({
        emailError: 'Not a valid e-mail format'
      });
    } else {
      changeUserMail(this.state.newEmail).then(data => window.alert(data));
    }
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
    } else {
      changeUserPassword(this.state.currentPassword, this.state.newPassword)
        .then(data => window.alert(data))
        .catch(err =>
          this.setState({
            passwordError: err.response.data
          })
        );
    }
  }

  render() {
    return (
      <Modal isOpen={this.props.isOpen}>
        <ModalHeader>
          <h2>User Settings</h2>
        </ModalHeader>
        <ModalBody>
          <Nav tabs>
            <NavItem style={{ cursor: 'pointer' }}>
              <NavLink
                className={classnames({ active: this.state.activeTab === '1' })}
                onClick={() => {
                  this.toggleTab('mailChange');
                }}
              >
                Change E-Mail
              </NavLink>
            </NavItem>
            <NavItem style={{ cursor: 'pointer' }}>
              <NavLink
                className={classnames({ active: this.state.activeTab === '2' })}
                onClick={() => {
                  this.toggleTab('passwordChange');
                }}
              >
                Change Password
              </NavLink>
            </NavItem>
          </Nav>
          {this.state.activeTab === 'mailChange' ? (
            <div>
              <InputGroup>
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>E-Mail</InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="New e-mail"
                  onChange={this.onNewEmailChange}
                />
              </InputGroup>
              <InputGroup>
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>E-Mail</InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="Retype new e-mail"
                  onChange={this.onConfirmationEmailChange}
                />
              </InputGroup>
              <Button
                color="primary"
                className="m-1 mr-auto"
                onClick={this.onEmailChangeSubmit}
              >
                Save new e-mail
              </Button>
              {this.state.emailError ? (
                <div
                  style={{
                    display: 'inline',
                    color: 'red',
                    marginLeft: '16px'
                  }}
                >
                  {this.state.emailError}
                </div>
              ) : null}
            </div>
          ) : null}

          {this.state.activeTab === 'passwordChange' ? (
            <div>
              <InputGroup>
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>Password</InputGroupText>
                </InputGroupAddon>
                <Input
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
                  type="password"
                  placeholder="Current password"
                  onChange={this.onCurrentPasswordChanged}
                />
              </InputGroup>
              <Button
                color="primary"
                className="m-1 mr-auto"
                onClick={this.onPasswordChangeSubmit}
              >
                Save new password
              </Button>
              {this.state.passwordError ? (
                <div
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
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" className="m-1" onClick={this.onCloseModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default UserSettingsModal;
