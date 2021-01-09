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
      userMail: '',
      password: '',
      buttonDisabled: false,
      isLoggedIn: props.isLoggedIn,
      time: undefined,
      loginFailed: false,
      show2FA: false
    };
    this.emailChange = this.emailChange.bind(this);
    this.passChange = this.passChange.bind(this);
    this.submit = this.submit.bind(this);
    this.onTokenChanged = this.onTokenChanged.bind(this);
    this.onLoginCanceled = this.onLoginCanceled.bind(this);
    this.passHandleKey = this.passHandleKey.bind(this);
    this.tick = this.tick.bind(this);
    this.checkLoggedInStatus = this.checkLoggedInStatus.bind(this);
    this.onLoginError = this.onLoginError.bind(this);
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
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    if (accessToken) {
      const decoded = jwt_decode(accessToken);
      if (
        decoded.exp * 1000 >= Date.now() &&
        !(decoded.twoFactorEnabled && !decoded.twoFactorVerified)
      ) {
        getUserMail([decoded.id])
          .then(mail => {
            this.props.onUserLoggedIn(accessToken, refreshToken, mail.email);
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

  emailChange(event) {
    this.setState(
      update(this.state, {
        $merge: {
          userMail: event.target.value
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
    this.setState({
      token: e.target.value
    });
    if (!e.target || !e.target.value) return;
    if (e.target.value.length === 6) {
      verify2FA(e.target.value)
        .then(data => {
          if (data.isTwoFactorAuthenticated) {
            this.props.onUserLoggedIn(data.access_token, data.refresh_token);
            this.setState({
              isLoggedIn: true
            });
          }
        })
        .catch(err => {
          this.onLoginError();
        });
    }
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
      userMail: '',
      password: ''
    });
  }

  submit() {
    const user = undefined;
    this.setState({ buttonDisabled: true });
    loginUser(this.state.userMail, this.state.password)
      .then(data => {
        const decoded = jwt_decode(data.access_token);
        setToken(data.access_token, data.refresh_token);
        getUserMail([decoded.id]).then(mail => {
          if (!data.twoFactorEnabled) {
            this.props.onUserLoggedIn(
              data.access_token,
              data.refresh_token,
              mail.email
            );
            this.setState({
              isLoggedIn: true,
              buttonDisabled: false,
              password: '',
              userMail: ''
            });
          } else {
            this.setState({
              show2FA: true
            });
          }
        });
      })
      .catch(err => {
        this.onLoginError();
      });
  }

  onLoginError() {
    this.setState(
      {
        loginFailed: true
      },
      () => {
        //Wait for animation to stop then reset page
        setTimeout(() => {
          this.setState({
            loginFailed: false,
            buttonDisabled: false,
            password: '',
            token: ''
          });
        }, 300);
      }
    );
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
    if (this.state.isLoggedIn) {
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
          <Alert color="info" hidden={!this.state.show2FA}>
            Your device's time must be synchronized with the server time or
            otherwise your token might be rejected. The current server time is:{' '}
            <b>{this.state.time ? this.state.time.toLocaleString() : ''}</b>
          </Alert>
          <Row>
            <Col className="login" xs={11} sm={6} lg={4}>
              <FadeInUp duration="0.3s" playState="running">
                <Card
                  style={
                    this.state.loginFailed
                      ? {
                          animation: 'hzejgT 0.3s ease 0s 1 normal none running'
                        }
                      : null
                  }
                >
                  <CardHeader hidden={this.state.show2FA}>
                    <b>Explorer Login</b>
                  </CardHeader>
                  <CardBody hidden={this.state.show2FA}>
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
                              value={this.state.userMail}
                              onChange={this.emailChange}
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
                    hidden={!this.state.show2FA}
                    style={{ alignContent: 'center' }}
                  >
                    <b>Two Factor Authentication</b>
                  </CardHeader>
                  <CardBody
                    hidden={!this.state.show2FA}
                    style={{ margin: 'auto' }}
                  >
                    <Input
                      autoFocus
                      className={'mt-1'}
                      id="tokenInput"
                      placeholder="Token"
                      value={this.state.token}
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
