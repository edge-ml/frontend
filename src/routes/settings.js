import React, { Component } from 'react';
import { Container, Col, Row, Table, Button } from 'reactstrap';
import { view } from 'react-easy-state';

import Loader from '../modules/loader';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

import EditUserModal from '../components/EditUserModal/EditUserModal';
import EditSourceModal from '../components/EditSourceModal/EditSourceModal';
import TwoFAconfigModal from '../components/2FAConfigModal/2FaConfigModal';
import {
  init2FA,
  reset2FA
} from '../services/ApiServices/AuthentificationServices';

import {
  editUser,
  addUser,
  subscribeSources,
  addSource,
  editSource,
  deleteSource
} from '../services/SocketService';

import {
  subscribeUsers,
  deleteUser
} from '../services/ApiServices/AuthentificationServices';

class SettingsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      users: [],
      userModal: {
        isOpen: false,
        isNewUser: false,
        user: undefined
      },
      user: undefined,
      sourceModal: {
        isOpen: false,
        isNewSource: false,
        source: undefined
      },
      TwoFaModal: {
        isOpen: false
      },
      qrCode: undefined,
      sources: [],
      videoEnaled: this.props.getVideoOptions().videoEnabled,
      playButtonEnabled: this.props.getVideoOptions().playButtonEnabled,
      isAdmin: false
    };

    this.onAddUser = this.onAddUser.bind(this);
    this.onUsersChanged = this.onUsersChanged.bind(this);
    this.toggleUserModal = this.toggleUserModal.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onSaveUser = this.onSaveUser.bind(this);
    this.onReset2FA = this.onReset2FA.bind(this);

    /*this.toggleSourceModal = this.toggleSourceModal.bind(this);*/
    this.onSourcesChanged = this.onSourcesChanged.bind(this);
    this.onAddSource = this.onAddSource.bind(this);
    this.onSaveSource = this.onSaveSource.bind(this);
    this.onDeleteSource = this.onDeleteSource.bind(this);
    this.toggleConfigure2FAModal = this.toggleConfigure2FAModal.bind(this);
    this.on2FAModalClose = this.on2FAModalClose.bind(this);
    this.get2FAQrCode = this.get2FAQrCode.bind(this);
    this.handle2FaButton = this.handle2FaButton.bind(this);
  }

  get2FAQrCode(callback) {
    init2FA(this.props.accessToken, qrCode => {
      this.setState(
        {
          qrCode: qrCode
        },
        callback
      );
    });
  }

  on2FAModalClose() {
    this.setState({
      TwoFaModal: {
        isOpen: false
      }
    });
  }

  toggleConfigure2FAModal() {
    this.get2FAQrCode(() => {
      this.setState({
        TwoFaModal: {
          isOpen: !this.state.TwoFaModal.isOpen
        }
      });
    });
  }

  handle2FaButton() {
    if (this.props.twoFactorEnabled) {
      var status = window.confirm('Disable 2FA?');
      if (status) {
        reset2FA(this.props.accessToken, () => {
          window.alert('2FA disabled');
        });
      }
    } else {
      this.toggleConfigure2FAModal();
    }
  }

  componentDidMount() {
    subscribeUsers(this.props.accessToken, users => {
      console.log(users);
      if (users.length === 0) {
        this.setState({
          isAdmin: false
        });
      } else {
        this.onUsersChanged(users);
        this.setState({
          isAdmin: true
        });
      }
    });
    let userMail = this.props.getCurrentUserMail();
    let userData = { email: userMail };
    this.setState({
      user: userData
    });
    subscribeSources(sources => {
      this.onSourcesChanged(sources);
    });
  }

  toggleUserModal(user, isNewUser) {
    this.setState({
      userModal: {
        isOpen: true,
        isNewUser: isNewUser,
        user: user
      }
    });
  }

  toggleVideoModal() {
    this.setState({
      videoEnaled: !this.state.videoEnaled
    });
    this.props.onVideoOptionsChange(
      !this.state.videoEnaled,
      this.state.playButtonEnabled
    );
  }

  togglePlayButtonModal() {
    this.setState({
      playButtonEnabled: !this.state.playButtonEnabled
    });
    this.props.onVideoOptionsChange(
      this.state.videoEnaled,
      !this.state.playButtonEnabled
    );
  }

  onCloseModal() {
    this.setState({
      userModal: {
        isOpen: false,
        isNewUser: false,
        user: undefined
      },
      sourceModal: {
        isOpen: false,
        isNewSource: false,
        source: undefined
      }
    });
  }

  onSaveUser(
    username,
    newName,
    newEmail,
    newPassword,
    isAdmin,
    confirmationPassword
  ) {
    editUser(
      username,
      newName,
      newEmail,
      newPassword,
      isAdmin,
      confirmationPassword,
      err => {
        window.alert(err);
        return;
      }
    );

    if (this.state.user.username === username && username !== newName) {
      // change own name
      this.props.onLogout();
    }
  }

  onAddUser(username, email, password, isAdmin, confirmationPassword) {
    addUser(username, email, password, isAdmin, confirmationPassword, err => {
      window.alert(err);
    });
  }

  onReset2FA(username, confirmationPassword) {
    reset2FA(username, confirmationPassword, err => {
      window.alert(err);
    });
  }

  onUsersChanged(users) {
    this.setState({
      users: users
    });
  }

  onAddSource(name, url, enabled) {
    addSource(name, url, enabled, err => {
      window.alert(err);
    });
  }

  onSaveSource(name, newName, newUrl, enabled) {
    editSource(name, newName, newUrl, enabled, err => {
      window.alert(err);
    });
  }

  onDeleteSource(name) {
    deleteSource(name);
  }

  onSourcesChanged(sources) {
    this.setState({
      sources: sources
    });
  }

  render() {
    console.log(this.state.users);
    return (
      <Loader>
        <Container>
          <Row className="mt-3">
            <Col>
              <h3>Settings</h3>
              <Table responsive>
                <thead>
                  <tr className={'bg-light'}>
                    <th>Settings</th>
                    <th>Enabled</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>Video</th>
                    <td>
                      {
                        <FontAwesomeIcon
                          style={{
                            color: this.state.videoEnaled
                              ? '#43A047'
                              : '#b71c1c'
                          }}
                          icon={this.state.videoEnaled ? faCheck : faTimes}
                        />
                      }
                    </td>
                    <td>
                      <Button
                        block
                        onClick={e => {
                          this.toggleVideoModal();
                        }}
                        className="btn-secondary mt-0 btn-edit"
                      >
                        Toggle
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <th>Play Button</th>
                    <td>
                      {
                        <FontAwesomeIcon
                          style={{
                            color: this.state.playButtonEnabled
                              ? '#43A047'
                              : '#b71c1c'
                          }}
                          icon={
                            this.state.playButtonEnabled ? faCheck : faTimes
                          }
                        />
                      }
                    </td>
                    <td>
                      <Button
                        block
                        onClick={e => {
                          this.togglePlayButtonModal();
                        }}
                        className="btn-secondary mt-0 btn-edit"
                      >
                        Toggle
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <th>
                      {this.props.twoFactorEnabled
                        ? '2FA enabled'
                        : '2FA disabled'}
                    </th>
                    <td></td>
                    <td>
                      <Button
                        block
                        onClick={this.handle2FaButton}
                        className="btn-secondary mt-0 btn-edit"
                      >
                        {this.props.twoFactorEnabled ? 'Disable' : 'Enable'}
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>

          {this.state.isAdmin ? (
            <div>
              <h3>Registerd Users</h3>
              <Row className="mt-3">
                <Col>
                  <Table responsive>
                    <thead>
                      <tr className={'bg-light'}>
                        <th>E-Mail</th>
                        <th>Admin Rights</th>
                        <th>2FA Configured</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.users.map((user, index) => {
                        return (
                          <tr key={index}>
                            <th>{user.email}</th>
                            <td>
                              {
                                <FontAwesomeIcon
                                  style={{
                                    color:
                                      user.role === 'admin'
                                        ? '#43A047'
                                        : '#b71c1c'
                                  }}
                                  icon={
                                    user.role === 'admin' ? faCheck : faTimes
                                  }
                                />
                              }
                            </td>
                            <td>
                              {
                                <FontAwesomeIcon
                                  style={{
                                    color: user.twoFactorEnabled
                                      ? '#43A047'
                                      : '#b71c1c'
                                  }}
                                  icon={
                                    user.twoFactorEnabled ? faCheck : faTimes
                                  }
                                />
                              }
                            </td>
                            <td>
                              <Button
                                block
                                className="btn-secondary mt-0 btn-edit"
                                onClick={e => {
                                  this.toggleUserModal(user, false);
                                }}
                              >
                                Edit
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                  {this.state.isAdmin ? (
                    <Button
                      block
                      className="mb-5"
                      color="secondary"
                      outline
                      onClick={e => this.toggleUserModal(null, true)}
                    >
                      + Add
                    </Button>
                  ) : null}
                </Col>
              </Row>
            </div>
          ) : null}
        </Container>
        <EditUserModal
          isOpen={this.state.userModal.isOpen}
          onCloseModal={this.onCloseModal}
          isNewUser={this.state.userModal.isNewUser}
          user={this.state.userModal.user}
          onSave={this.onSaveUser}
          onDeleteUser={this.onDeleteUser}
          onLogout={this.props.onLogout}
          onAddUser={this.onAddUser}
          onReset2FA={this.onReset2FA}
          currentIsAdmin={this.state.isAdmin}
          getCurrentUserMail={this.props.getCurrentUserMail}
        />
        <EditSourceModal
          isOpen={this.state.sourceModal.isOpen}
          onCloseModal={this.onCloseModal}
          isNewSource={this.state.sourceModal.isNewSource}
          source={this.state.sourceModal.source}
          onSave={this.onSaveSource}
          onDeleteSource={this.onDeleteSource}
          onAddSource={this.onAddSource}
        />
        <TwoFAconfigModal
          isOpen={this.state.TwoFaModal.isOpen}
          accessToken={this.props.accessToken}
          setAccessToken={this.props.setAccessToken}
          on2FAModalClose={this.on2FAModalClose}
          qrCode={this.state.qrCode}
        ></TwoFAconfigModal>
      </Loader>
    );
  }
}

export default view(SettingsPage);
