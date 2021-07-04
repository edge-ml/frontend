import React, { Component } from 'react';
import {
  Modal,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  NavItem,
  NavLink,
  Nav
} from 'reactstrap';
import classnames from 'classnames';
import MailSettings from './MailSettings';
import PasswordSettings from './PasswordSettings';
import TwoFaSettings from './TwoFaSettings';
import UserNameSettings from './UserNameSettings';
import DeleteUser from './DeleteUser';
import UserSettingsProvider from './UserSettingsProvider';

class UserSettingsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'mailChange'
    };
    this.baseState = this.state;
    this.onCloseModal = this.onCloseModal.bind(this);
    this.toggleTab = this.toggleTab.bind(this);
  }

  toggleTab(e) {
    this.setState({
      activeTab: e
    });
  }

  onCloseModal() {
    this.setState(this.baseState);
    this.props.onClose();
  }

  render() {
    return (
      <Modal size="lg" isOpen={this.props.isOpen}>
        <ModalHeader style={{ borderBottom: 'None' }}>
          User Settings
        </ModalHeader>
        <Nav tabs>
          <NavItem style={{ cursor: 'pointer' }}>
            <NavLink
              className={classnames({
                active: this.state.activeTab === 'mailChange'
              })}
              onClick={() => {
                this.toggleTab('mailChange');
              }}
            >
              Change E-Mail
            </NavLink>
          </NavItem>
          <NavItem style={{ cursor: 'pointer' }}>
            <NavLink
              className={classnames({
                active: this.state.activeTab === 'passwordChange'
              })}
              onClick={() => {
                this.toggleTab('passwordChange');
              }}
            >
              Change Password
            </NavLink>
          </NavItem>
          <NavItem style={{ cursor: 'pointer' }}>
            <NavLink
              className={classnames({
                active: this.state.activeTab === '2FA'
              })}
              onClick={() => {
                this.toggleTab('2FA');
              }}
            >
              2FA
            </NavLink>
          </NavItem>
          <NavItem style={{ cursor: 'pointer' }}>
            <NavLink
              className={classnames({
                active: this.state.activeTab === 'userName'
              })}
              onClick={() => {
                this.toggleTab('userName');
              }}
            >
              Change Username
            </NavLink>
          </NavItem>

          <NavItem style={{ cursor: 'pointer' }}>
            <NavLink
              className={classnames({
                active: this.state.activeTab === 'deleteUser'
              })}
              onClick={() => {
                this.toggleTab('deleteUser');
              }}
            >
              Delete user
            </NavLink>
          </NavItem>
        </Nav>
        <ModalBody>
          {this.state.activeTab === 'mailChange' ? (
            <MailSettings id="mailSettings"></MailSettings>
          ) : null}

          {this.state.activeTab === 'passwordChange' ? (
            <PasswordSettings id="passwordSettings"></PasswordSettings>
          ) : null}
          {this.state.activeTab === '2FA' ? (
            <TwoFaSettings
              id="twoFaSettings"
              twoFAEnabled={this.props.twoFAEnabled}
              onLogout={this.props.onLogout}
              enable2FA={this.props.enable2FA}
            ></TwoFaSettings>
          ) : null}
          {this.state.activeTab === 'userName' ? (
            <UserNameSettings id="userNameSettings"></UserNameSettings>
          ) : null}
          {this.state.activeTab === 'deleteUser' ? (
            <UserSettingsProvider onLogout={this.props.onLogout}>
              <DeleteUser userMail={this.props.userMail}></DeleteUser>
            </UserSettingsProvider>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button
            id="buttonCloseSettings"
            color="secondary"
            className="m-1"
            onClick={this.onCloseModal}
          >
            Close Settings
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default UserSettingsModal;
