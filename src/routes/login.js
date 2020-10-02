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
  CardHeader,
  Alert
} from 'reactstrap';
import { MailIcon, ShieldIcon } from 'react-octicons';
import update from 'immutability-helper';
import { FadeInUp } from 'animate-components';
import { getServerTime } from '../services/helpers.js';
import {
  loginUser,
  verify2FA
} from '../services/ApiServices/AuthentificationServices';

import LocalStorageService from '../services/LocalStorageService';
const localStorageService = LocalStorageService.getService();

class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usermail: '',
      password: '',
      button: {
        disabled: false
      },
      isLoggedIn: props.isLoggedIn,
      isTwoFactorAuthenticated: props.isTwoFactorAuthenticated,
      on2FA: props.on2FA,
      twoFactorEnabled: props.twoFactorEnabled,
      authenticationHandlers: {
        onLogin: props.onLogin,
        onCancelLogin: props.onCancelLogin,
        didLoginFail: false
      },
      twoFactorAuthentication: {
        qrCode: undefined,
        token: undefined,
        tokenFailed: false
      },
      time: undefined,

      user: {}
    };
    this.emailchange = this.emailchange.bind(this);
    this.passChange = this.passChange.bind(this);
    this.submit = this.submit.bind(this);
    this.onTokenChanged = this.onTokenChanged.bind(this);
    this.onVerified = this.onVerified.bind(this);
    this.onLoginCanceled = this.onLoginCanceled.bind(this);
    this.onDidRestoreSession = this.onDidRestoreSession.bind(this);
    this.passHandleKey = this.passHandleKey.bind(this);
    this.tick = this.tick.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState(
      update(this.state, {
        isLoggedIn: {
          $set: props.isLoggedIn
        },
        isTwoFactorAuthenticated: {
          $set: props.isTwoFactorAuthenticated
        }
      })
    );
  }

  emailchange(event) {
    this.setState(
      update(this.state, {
        $merge: {
          usermail: event.target.value
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

  passHandleKey(event) {
    if (event.keyCode === 13) {
      this.submit();
    }
  }

  onTokenChanged(e) {
    if (!e.target || !e.target.value) return;
    //if (e.target.value.length > 6) return;
    else if (e.target.value.length === 6) {
      verify2FA(this.state.user.access_token, e.target.value, data => {
        if (data) {
          if (data && data.status && data.status !== 200) {
            window.alert(data.data.error);
          } else {
            this.setState(
              {
                tokenFailed: false,
                user: data
              },
              () => {
                this.props.setUser(data, () => {
                  this.props.onLogin(true);
                });
              }
            );
          }
        }
      });
    }
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

    loginUser(this.state.usermail, this.state.password)
      .then(data => {
        localStorageService.setToken(data.access_token, data.refresh_token);
        this.setState(
          update(this.state, {
            $merge: {
              button: {
                disabled: false
              }
            }
          }),
          () => {
            this.setState(
              {
                user: data,
                isLoggedIn: true,
                isTwoFactorAuthenticated: false
              },
              () => {
                this.check2FALogin();
                this.props.setUser(data);
              }
            );
          }
        );
      })
      .catch(err => {
        console.log(err);
      });
  }

  check2FALogin() {
    if (!this.state.user.twoFactorEnabled) {
      this.props.setUser(this.state.user, () => {
        this.setState({
          isLoggedIn: true
        });
      });
    }
  }

  componentDidMount() {
    this.setState({ time: getServerTime() });
    this.interval = setInterval(this.tick, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  tick() {
    let time = new Date(this.state.time);

    if (time) {
      time.setSeconds(time.getSeconds() + 1);
      this.setState({ time });
    }
  }

  render() {
    if (
      (this.state.isLoggedIn && !this.state.user.twoFactorEnabled) ||
      (this.state.user.twoFactorAuthentication && this.state.isLoggedIn)
    ) {
      return this.props.children;
    } else {
      return (
        <Container
          className="Page"
          style={{
            paddingLeft: 0,
            paddingRight: 0
          }}
        >
          <Alert
            color="info"
            hidden={
              !(this.state.isLoggedIn && !this.state.user.twoFactorVerified)
            }
          >
            Your device's time must be synchronized with the server time or
            otherwise your token might be rejected. The current server time is:{' '}
            <b>{this.state.time ? this.state.time.toLocaleString() : ''}</b>
          </Alert>
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
                                <MailIcon />
                              </InputGroupText>
                            </InputGroupAddon>
                            <Input
                              type="email"
                              name="email"
                              id="email"
                              placeholder="email"
                              onChange={this.emailchange}
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
                              onKeyDown={this.passHandleKey}
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
                        !this.state.user.twoFactorVerified &&
                        this.state.user.twoFactorEnabled
                      )
                    }
                    style={{ alignContent: 'center' }}
                  >
                    {this.state.twoFactorAuthentication.qrCode ? (
                      <b>Two Factor Authentication Setup</b>
                    ) : (
                      <b>Two Factor Authentication</b>
                    )}{' '}
                  </CardHeader>
                  <CardBody
                    hidden={
                      !(
                        this.state.isLoggedIn &&
                        !this.state.user.twoFactorVerified &&
                        this.state.user.twoFactorEnabled
                      )
                    }
                    style={{ margin: 'auto' }}
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
                      id="tokenInput"
                      placeholder="Token"
                      value={this.state.twoFactorAuthentication.token}
                      style={{ textAlign: 'center' }}
                      onChange={this.onTokenChanged}
                      ref={input => {
                        this.tokenInput = input;
                      }}
                    />
                    <Button
                      block
                      onClick={this.onLoginCanceled}
                      className={'mt-2'}
                    >
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
