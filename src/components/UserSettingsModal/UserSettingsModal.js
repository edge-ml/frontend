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
      <Modal isOpen={this.props.isOpen}>
        <ModalHeader>User Settings</ModalHeader>
        <ModalBody>
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
          </Nav>
          {this.state.activeTab === 'mailChange' ? (
            <MailSettings></MailSettings>
          ) : null}

          {this.state.activeTab === 'passwordChange' ? (
            <PasswordSettings></PasswordSettings>
          ) : null}
          {this.state.activeTab === '2FA' ? (
            <TwoFaSettings
              twoFAEnabled={this.props.twoFAEnabled}
              onLogout={this.onLogout}
            ></TwoFaSettings>
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
