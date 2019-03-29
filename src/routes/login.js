import React, { Component } from 'react';
import {
  Container,
  Col,
  Row,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Button
} from 'reactstrap';
import { PersonIcon, ShieldIcon } from 'react-octicons';
import Request from 'request-promise';
import update from 'immutability-helper';

import State from '../state';

import { login } from '../services/SocketService';

class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      button: {
        color: 'secondary',
        disabled: false
      },
      authed: props.isAuthenticated,
      authenticationHandlers: {
        onLogin: props.onLogin
      }
    };
    this.userChange = this.userChange.bind(this);
    this.passChange = this.passChange.bind(this);
    this.submit = this.submit.bind(this);
    this.onLogin = this.onLogin.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState(
      update(this.state, {
        authed: { $set: props.isAuthenticated }
      })
    );
  }

  userChange(event) {
    this.setState(
      update(this.state, {
        $merge: {
          username: event.target.value
        }
      })
    );
  }

  passChange(event) {
    this.setState(
      update(this.state, {
        $merge: {
          password: event.target.value
        }
      })
    );
  }

  onLogin(didSucceed) {
    if (didSucceed) {
      this.setState(
        update(this.state, {
          $merge: {
            button: {
              disabled: false,
              color: 'secondary'
            }
          }
        })
      );
    }
    this.state.authenticationHandlers.onLogin(didSucceed);
  }

  submit(event) {
    this.setState(
      update(this.state, {
        $merge: {
          button: {
            disabled: true,
            color: 'primary'
          }
        }
      })
    );

    login(this.state.username, this.state.password, this.onLogin);
  }

  componentDidMount() {
    // check if token exsists
    if (window.localStorage.getItem('id_token')) {
      const options = {
        method: 'GET',
        url: `${State.edge}/authed`,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('id_token')}`
        }
      };

      Request(options)
        .then(res => {
          this.setState(
            update(this.state, {
              authed: { $set: true }
            })
          );
        })
        .catch(err => {
          if (err.statusCode === 401) {
            this.setState(
              update(this.state, {
                authed: { $set: false }
              })
            );
            window.localStorage.clear();
          }
        });
    }
  }

  render() {
    if (this.state.authed) {
      return this.props.children;
    } else {
      return (
        <Container className="Page">
          <Row>
            <Col className="login" xs={11} sm={6} lg={4}>
              <Row>
                <Col>
                  <h2>Sign In</h2>
                  <Col>
                    <InputGroup>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <PersonIcon />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        type="username"
                        name="username"
                        id="username"
                        placeholder="username"
                        onChange={this.userChange}
                      />
                    </InputGroup>
                  </Col>
                  <Col>
                    <InputGroup>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <ShieldIcon />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        type="password"
                        name="password"
                        id="password"
                        placeholder="password"
                        onChange={this.passChange}
                      />
                    </InputGroup>
                  </Col>
                  <Col>
                    <Button
                      id="login-button"
                      onClick={this.submit}
                      disabled={this.state.button.disabled}
                      color={this.state.button.color}
                      block
                    >
                      Login
                    </Button>
                  </Col>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      );
    }
  }
}
export default LoginPage;
