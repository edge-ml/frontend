import React, { Component } from 'react';
import { Container, Col, Row, Table, Badge, Button } from 'reactstrap';
import { view } from 'react-easy-state';

import Loader from '../modules/loader';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

import EditUserModal from '../components/EditUserModal/EditUserModal';

import {
  subscribeUsers,
  unsubscribeUsers,
  updateUsername,
  updatePassword,
  deleteUser,
  addUser,
  reset2FA
} from '../services/SocketService';

class SettingsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      users: [],
      modal: {
        isOpen: false,
        isNewUser: false,
        user: undefined
      }
    };

    this.onAddUser = this.onAddUser.bind(this);
    this.onUsersChanged = this.onUsersChanged.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onDeleteUser = this.onDeleteUser.bind(this);
    this.onReset2FA = this.onReset2FA.bind(this);
  }

  componentDidMount() {
    subscribeUsers(users => {
      this.onUsersChanged(users);
    });
  }

  componentWillUnmount() {
    unsubscribeUsers();
  }

  toggleModal(user, isNewUser) {
    this.setState({
      modal: {
        isOpen: !this.state.modal.isOpen,
        isNewUser: isNewUser,
        user: user
      }
    });
  }

  onCloseModal() {
    this.setState({
      modal: {
        isOpen: false,
        isNewUser: false,
        user: undefined
      }
    });
  }

  onSave(newName, newPassword, confirmationPassword) {
    let username = this.state.modal.user.username;

    if (newName !== username) {
      updateUsername(username, newName, confirmationPassword, hasErr => {
        if (hasErr) {
          window.alert('This user already exists.');
          return;
        }
      });
    }

    if (newPassword) {
      updatePassword(username, newPassword, confirmationPassword);
    }

    subscribeUsers(users => {
      this.onUsersChanged(users);
    });
  }

  onDeleteUser(username, confirmationPassword) {
    deleteUser(username, confirmationPassword);

    if (
      this.state.users.length === 1 &&
      !this.state.users[0].isAdmin &&
      this.state.users[0].username === username
    ) {
      // delete self
      this.props.onLogout();
    } else {
      subscribeUsers(users => {
        this.onUsersChanged(users);
      });
    }
  }

  onAddUser(username, password, isAdmin) {
    addUser(username, password, isAdmin, hasErr => {
      if (hasErr) {
        window.alert('This user already exists.');
      } else {
        subscribeUsers(users => {
          this.onUsersChanged(users);
        });
      }
    });
  }

  onReset2FA(username, confirmationPassword) {
    reset2FA(username, confirmationPassword);

    subscribeUsers(users => {
      this.onUsersChanged(users);
    });
  }

  onUsersChanged(users) {
    this.setState({
      users: users
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
                              this.toggleModal(user, false);
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
                  onClick={e => this.toggleModal(null, true)}
                >
                  + Add
                </Button>
              ) : null}
            </Col>
          </Row>
        </Container>
        <EditUserModal
          isOpen={this.state.modal.isOpen}
          onCloseModal={this.onCloseModal}
          isNewUser={this.state.modal.isNewUser}
          user={this.state.modal.user}
          onSave={this.onSave}
          onDeleteUser={this.onDeleteUser}
          onAddUser={this.onAddUser}
          onReset2FA={this.onReset2FA}
          currentIsAdmin={isAdmin}
        />
      </Loader>
    );
  }
}

export default view(SettingsPage);
