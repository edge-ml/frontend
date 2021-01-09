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
  getUserMail,
  loginUser,
  verify2FA
} from '../services/ApiServices/AuthentificationServices';
import jwt_decode from 'jwt-decode';

import {
  getAccessToken,
  getRefreshToken,
  setToken
} from '../services/LocalStorageService';

class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usermail: '',
      password: '',
      buttonDisabled: false,
      isLoggedIn: props.isLoggedIn,
      isTwoFactorAuthenticated: props.isTwoFactorAuthenticated,
      twoFactorEnabled: props.twoFactorEnabled,
      authenticationHandlers: {
        didLoginFail: false,
        onCancelLogin: props.onCancelLogin
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
    this.checkLoggedInStatus = this.checkLoggedInStatus.bind(this);
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

  checkLoggedInStatus() {
    var accessToken = getAccessToken();
    var refreshToken = getRefreshToken();
    if (accessToken) {
      var decoded = jwt_decode(accessToken);
      if (
        decoded.exp * 1000 >= Date.now() &&
        !(decoded.twoFactorEnabled && !decoded.twoFactorVerified)
      ) {
        getUserMail([decoded.id])
          .then(mail => {
            this.props.setUser({ ...this.state.user, email: mail.email });
          })
          .catch(err => {});
        this.setState({
          isLoggedIn: true
        });
      }
    }
    if (refreshToken && jwt_decode(refreshToken).exp * 1000 >= Date.now()) {
      //TODO: Need to obtain new Access_Token here
      return;
    }
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
      verify2FA(e.target.value)
        .then(data => {
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
        })
        .catch(err => {
          var tmp = this.state.twoFactorAuthentication;
          tmp.tokenFailed = true;
          this.setState(
            {
              twoFactorAuthentication: tmp
            },
            () => {
              setTimeout(() => {
                document.getElementById('tokenInput').value = '';
                tmp.tokenFailed = false;
                this.setState({ twoFactorAuthentication: tmp });
              }, 300);
            }
          );
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
    var tmpAuth = this.state.authenticationHandlers;
    var tmp2FA = this.state.twoFactorAuthentication;
    tmpAuth.didLoginFail = false;
    tmp2FA.qrCode = undefined;
    tmp2FA.token = undefined;
    tmp2FA.tokenFailed = false;
    this.setState({
      authenticationHandlers: tmpAuth,
      twoFactorAuthentication: tmp2FA,
      usermail: '',
      password: ''
    });
  }

  submit() {
    this.setState({ buttonDisabled: true });
    loginUser(this.state.usermail, this.state.password)
      .then(data => {
        setToken(data.access_token, data.refresh_token);
        this.setState({ buttonDisabled: false }, () => {
          this.setState(
            {
              user: data,
              isLoggedIn: true,
              isTwoFactorAuthenticated: false,
              usermail: '',
              password: ''
            },
            () => {
              this.check2FALogin();
              var decoded = jwt_decode(data.access_token);
              getUserMail(decoded.id)
                .then(mail => {
                  this.props.setUser({ ...data, email: mail.email });
                })
                .catch(err => {
                  console.log(err);
                });
            }
          );
        });
      })
      .catch(err => {
        var tmp = this.state.authenticationHandlers;
        tmp.didLoginFail = true;
        this.setState(
          {
            authenticationHandlers: tmp
          },
          () => {
            //Wait for animation to stop then reset page
            setTimeout(() => {
              tmp.didLoginFail = false;
              this.setState({
                authenticationHandlers: tmp,
                buttonDisabled: false,
                password: ''
              });
            }, 300);
          }
        );
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
    this.checkLoggedInStatus();
    getServerTime()
      .then(serverTime => this.setState({ time: serverTime }))
      .catch(err => {});
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
                              value={this.state.usermail}
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
                              value={this.state.password}
                              onChange={this.passChange}
                              onKeyDown={this.passHandleKey}
                            />
                          </InputGroup>
                        </Col>
                        <Col>
                          <Button
                            id="login-button"
                            onClick={this.submit}
                            disabled={this.state.buttonDisabled}
                            color="primary"
                            block
                          >
                            Login
                          </Button>
                        </Col>
                        <Col className="my-2">
                          <div style={{ display: 'inline-block' }}>
                            Have no account? Register{' '}
                            <a
                              style={{ display: 'inline-block' }}
                              href="/register"
                            >
                              here
                            </a>
                          </div>
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
