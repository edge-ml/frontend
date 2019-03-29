import React, { Component } from 'react';
import {
  Container,
  Col,
  Row,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Button,
  Modal,
  ModalHeader,
  ModalBody
} from 'reactstrap';
import { PersonIcon, ShieldIcon } from 'react-octicons';
import Request from 'request-promise';
import update from 'immutability-helper';

import State from '../state';

import {
  login,
  twoFAAuthenticate,
  subscribeVerified
} from '../services/SocketService';

class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      button: {
        color: 'primary',
        disabled: false
      },
      isLoggedIn: props.isLoggedIn,
      isTwoFactorAuthenticated: props.isTwoFactorAuthenticated,
      authenticationHandlers: {
        onLogin: props.onLogin,
        oneTwoFA: props.oneTwoFA
      },
      twoFactorAuthentication: {
        qrCode: undefined,
        token: undefined
      }
    };
    this.userChange = this.userChange.bind(this);
    this.passChange = this.passChange.bind(this);
    this.submit = this.submit.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.onTwoFA = this.onTwoFA.bind(this);
    this.onTokenChanged = this.onTokenChanged.bind(this);
    this.onVerified = this.onVerified.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState(
      update(this.state, {
        isLoggedIn: { $set: props.isLoggedIn },
        isTwoFactorAuthenticated: { $set: props.isTwoFactorAuthenticated }
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
              disabled: false
            }
          }
        })
      );
      subscribeVerified(this.onVerified);
    }
    this.state.authenticationHandlers.onLogin(didSucceed);
  }

  onTwoFA(qrCode) {
    this.setState({
      twoFactorAuthentication: {
        qrCode: qrCode
      }
    });
  }

  onTokenChanged(e) {
    if (e.target.value.length > 6) return;
    else if (e.target.value.length === 6) {
      twoFAAuthenticate(e.target.value);
    }

    this.setState({
      twoFactorAuthentication: {
        token: e.target.value.trim(),
        qrCode: this.state.twoFactorAuthentication.qrCode
      }
    });
  }

  onVerified(success) {
    if (!success) alert('Token does not match. Try Again.');
    else {
      this.state.authenticationHandlers.oneTwoFA(success);
    }
  }

  submit(event) {
    this.setState(
      update(this.state, {
        $merge: {
          button: {
            disabled: true
          }
        }
      })
    );

    login(this.state.username, this.state.password, this.onLogin, this.onTwoFA);
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
    if (this.state.isLoggedIn && this.state.isTwoFactorAuthenticated) {
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
          <Modal
            isOpen={
              this.state.isLoggedIn && !this.state.isTwoFactorAuthenticated
            }
          >
            <ModalHeader>
              {this.state.twoFactorAuthentication.qrCode
                ? 'Scan the QR Code with Google Authenticator and enter the token to confirm.'
                : 'Enter the token shown in Google Authenticator.'}
            </ModalHeader>
            <ModalBody
              style={{
                margin: 'auto'
              }}
            >
              {this.state.twoFactorAuthentication.qrCode ? (
                <img
                  width="100%"
                  alt="2FA QR Code"
                  src={this.state.twoFactorAuthentication.qrCode}
                />
              ) : null}
              <Input
                autoFocus
                className={'mt-1'}
                placeholder="Token"
                value={this.state.twoFactorAuthentication.token}
                style={{
                  textAlign: 'center'
                }}
                onChange={this.onTokenChanged}
              />
            </ModalBody>
          </Modal>
        </Container>
      );
    }
  }
}
export default LoginPage;
