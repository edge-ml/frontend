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
  Card,
  CardBody,
  CardHeader
} from 'reactstrap';
import { PersonIcon, ShieldIcon } from 'react-octicons';
import Request from 'request-promise';
import update from 'immutability-helper';

import State from '../state';

import { FadeInUp } from 'animate-components';

import {
  login,
  twoFAAuthenticate,
  subscribeVerified,
  restoreSession
} from '../services/SocketService';

class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      button: {
        disabled: false
      },
      isLoggedIn: props.isLoggedIn,
      isTwoFactorAuthenticated: props.isTwoFactorAuthenticated,
      authenticationHandlers: {
        onLogin: props.onLogin,
        onTwoFA: props.onTwoFA,
        onCancelLogin: props.onCancelLogin,
        didLoginFail: false
      },
      twoFactorAuthentication: {
        qrCode: undefined,
        token: undefined,
        tokenFailed: false
      }
    };
    this.userChange = this.userChange.bind(this);
    this.passChange = this.passChange.bind(this);
    this.submit = this.submit.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.onTwoFA = this.onTwoFA.bind(this);
    this.onTokenChanged = this.onTokenChanged.bind(this);
    this.onVerified = this.onVerified.bind(this);
    this.onLoginCanceled = this.onLoginCanceled.bind(this);
    this.onDidRestoreSession = this.onDidRestoreSession.bind(this);

    restoreSession(this.onDidRestoreSession);
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
    this.setState(
      update(this.state, {
        $merge: {
          button: {
            disabled: false
          },
          authenticationHandlers: {
            didLoginFail: !didSucceed,
            onLogin: this.state.authenticationHandlers.onLogin,
            onTwoFA: this.state.authenticationHandlers.onTwoFA,
            onCancelLogin: this.state.authenticationHandlers.onCancelLogin
          }
        }
      })
    );

    if (didSucceed) {
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
    this.tokenInput.focus();
  }

  onTokenChanged(e) {
    if (e.target.value.length > 6) return;
    else if (e.target.value.length === 6) {
      twoFAAuthenticate(e.target.value);
    }

    this.setState({
      twoFactorAuthentication: {
        token: e.target.value.trim(),
        qrCode: this.state.twoFactorAuthentication.qrCode,
        tokenFailed: false
      }
    });
  }

  onVerified(success) {
    if (!success) {
      this.setState({
        twoFactorAuthentication: {
          token: this.state.twoFactorAuthentication.token,
          qrCode: this.state.twoFactorAuthentication.qrCode,
          tokenFailed: true
        }
      });
    } else {
      this.setState({
        twoFactorAuthentication: {
          token: undefined,
          qrCode: undefined,
          tokenFailed: false
        }
      });

      this.state.authenticationHandlers.onTwoFA(success);
    }
  }

  onDidRestoreSession() {
    this.onVerified(true);
  }

  onLoginCanceled() {
    this.state.authenticationHandlers.onCancelLogin();
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
              <FadeInUp duration="0.3s" playState="running">
                <Card
                  style={
                    this.state.authenticationHandlers.didLoginFail ||
                    this.state.twoFactorAuthentication.tokenFailed
                      ? {
                          animation: 'hzejgT 0.3s ease 0s 1 normal none running'
                        }
                      : null
                  }
                >
                  <CardHeader hidden={this.state.isLoggedIn}>
                    <b>Explorer Login</b>
                  </CardHeader>
                  <CardBody hidden={this.state.isLoggedIn}>
                    <Row>
                      <Col>
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
                            color="primary"
                            block
                          >
                            Login
                          </Button>
                        </Col>
                      </Col>
                    </Row>
                  </CardBody>
                  <CardHeader
                    hidden={
                      !(
                        this.state.isLoggedIn &&
                        !this.state.isTwoFactorAuthenticated
                      )
                    }
                    style={{ alignContent: 'center' }}
                  >
                    {this.state.twoFactorAuthentication.qrCode ? (
                      <b>Two Factor Authentication Setup</b>
                    ) : (
                      <b>Two Factor Authentication</b>
                    )}
                  </CardHeader>
                  <CardBody
                    hidden={
                      !(
                        this.state.isLoggedIn &&
                        !this.state.isTwoFactorAuthenticated
                      )
                    }
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
                      ref={input => {
                        this.tokenInput = input;
                      }}
                    />
                    <Button block onClick={this.onLoginCanceled}>
                      Cancel
                    </Button>
                  </CardBody>
                </Card>
              </FadeInUp>
            </Col>
          </Row>
        </Container>
      );
    }
  }
}
export default LoginPage;
