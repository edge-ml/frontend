import React, { Component } from 'react';
import { Container, Col, Row, Table, Badge, Button } from 'reactstrap';
import { view } from 'react-easy-state';

import Loader from '../modules/loader';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

import EditLabelingModal from '../components/EditLabelingModal/EditLabelingModal';

import { subscribeUsers, unsubscribeUsers } from '../services/SocketService';

class SettingsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      users: []
    };

    this.onAddUser = this.onAddUser.bind(this);
    this.onUsersChanged = this.onUsersChanged.bind(this);
  }

  componentDidMount() {
    subscribeUsers(users => {
      this.onUsersChanged(users);
    });
  }

  componentWillUnmount() {
    unsubscribeUsers();
  }

  onAddUser() {}

  onUsersChanged(users) {
    this.setState({
      users: users
    });
  }

  render() {
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
                          <Button block className="btn-secondary mt-0">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              <Button
                block
                className="mb-5"
                color="secondary"
                outline
                onClick={this.onAddUser}
              >
                + Add
              </Button>
            </Col>
          </Row>
        </Container>
      </Loader>
    );
  }
}

export default view(SettingsPage);
