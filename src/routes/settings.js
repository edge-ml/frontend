import React, { Component } from 'react';
import { Container, Col, Row, Table, Badge, Button } from 'reactstrap';
import { view } from 'react-easy-state';

import Loader from '../modules/loader';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

import EditUserModal from '../components/EditUserModal/EditUserModal';
import EditSourceModal from '../components/EditSourceModal/EditSourceModal';

import {
  subscribeUsers,
  unsubscribeUsers,
  editUser,
  deleteUser,
  addUser,
  reset2FA,
  getCurrentUser,
  subscribeSources,
  unsubscribeSources,
  addSource,
  editSource,
  deleteSource
} from '../services/SocketService';

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
      sources: []
    };

    this.onAddUser = this.onAddUser.bind(this);
    this.onUsersChanged = this.onUsersChanged.bind(this);
    this.toggleUserModal = this.toggleUserModal.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onSaveUser = this.onSaveUser.bind(this);
    this.onDeleteUser = this.onDeleteUser.bind(this);
    this.onReset2FA = this.onReset2FA.bind(this);

    this.toggleSourceModal = this.toggleSourceModal.bind(this);
    this.onSourcesChanged = this.onSourcesChanged.bind(this);
    this.onAddSource = this.onAddSource.bind(this);
    this.onSaveSource = this.onSaveSource.bind(this);
    this.onDeleteSource = this.onDeleteSource.bind(this);
  }

  componentDidMount() {
    subscribeUsers(users => {
      this.onUsersChanged(users);
    });

    getCurrentUser(user => {
      this.setState({ user });
    });

    subscribeSources(sources => {
      this.onSourcesChanged(sources);
    });
  }

  componentWillUnmount() {
    unsubscribeUsers();
    unsubscribeSources();
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

  toggleSourceModal(source, isNewSource) {
    this.setState({
      sourceModal: {
        isOpen: true,
        isNewSource: isNewSource,
        source: source
      }
    });
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

  onSaveUser(username, newName, newPassword, isAdmin, confirmationPassword) {
    editUser(
      username,
      newName,
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

  onDeleteUser(username, confirmationPassword) {
    deleteUser(username, confirmationPassword, err => {
      window.alert(err);
      return;
    });

    if (this.state.user.username === username) {
      this.props.onLogout();
    }
  }

  onAddUser(username, password, isAdmin, confirmationPassword) {
    addUser(username, password, isAdmin, confirmationPassword, err => {
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
    let isAdmin = this.state.users.length !== 1 || this.state.users[0].isAdmin;

    return (
      <Loader>
        <Container>
          <Row className="mt-3">
            <Col>
              <Table responsive>
                <thead>
                  <tr className={'bg-light'}>
                    <th>Name</th>
                    <th>URL</th>
                    <th>Enabled</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {this.state.sources.map((source, index) => {
                    return (
                      <tr className={'bg-light'}>
                        <th>{source.name}</th>
                        <td>{source.url}</td>
                        <td>
                          {
                            <FontAwesomeIcon
                              style={{
                                color: source.enabled ? '#43A047' : '#b71c1c'
                              }}
                              icon={source.enabled ? faCheck : faTimes}
                            />
                          }
                        </td>
                        <td>
                          {isAdmin ? (
                            <Button
                              block
                              className="btn-secondary mt-0"
                              onClick={e => {
                                this.toggleSourceModal(source, false);
                              }}
                            >
                              Edit
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              {isAdmin ? (
                <Button
                  block
                  className="mb-5"
                  color="secondary"
                  outline
                  onClick={e => this.toggleSourceModal(null, true)}
                >
                  + Add
                </Button>
              ) : null}
            </Col>
          </Row>

          <Row className="mt-3">
            <Col>
              <Table responsive>
                <thead>
                  <tr className={'bg-light'}>
                    <th>Username</th>
                    <th>Admin Rights</th>
                    <th>2FA Configured</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {this.state.users.map((user, index) => {
                    return (
                      <tr className={'bg-light'}>
                        <th>{user.username}</th>
                        <td>
                          {
                            <FontAwesomeIcon
                              style={{
                                color: user.isAdmin ? '#43A047' : '#b71c1c'
                              }}
                              icon={user.isAdmin ? faCheck : faTimes}
                            />
                          }
                        </td>
                        <td>
                          {
                            <FontAwesomeIcon
                              style={{
                                color: user.isRegistered ? '#43A047' : '#b71c1c'
                              }}
                              icon={user.isRegistered ? faCheck : faTimes}
                            />
                          }
                        </td>
                        <td>
                          <Button
                            block
                            className="btn-secondary mt-0"
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
              {isAdmin ? (
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
        </Container>
        <EditUserModal
          isOpen={this.state.userModal.isOpen}
          onCloseModal={this.onCloseModal}
          isNewUser={this.state.userModal.isNewUser}
          user={this.state.userModal.user}
          onSave={this.onSaveUser}
          onDeleteUser={this.onDeleteUser}
          onAddUser={this.onAddUser}
          onReset2FA={this.onReset2FA}
          currentIsAdmin={isAdmin}
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
      </Loader>
    );
  }
}

export default view(SettingsPage);
