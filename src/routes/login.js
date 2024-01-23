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
  Alert,
  Fade,
} from 'reactstrap';
import { PersonIcon, ShieldIcon } from 'react-octicons';
import update from 'immutability-helper';
import { getServerTime } from '../services/helpers.js';
import {
  loginUser,
  loginUserRefresh,
  verify2FA,
} from '../services/ApiServices/AuthentificationServices';
import jwt_decode from 'jwt-decode';

import {
  getAccessToken,
  getRefreshToken,
  setToken,
} from '../services/LocalStorageService';
import EdgeMLBrandLogo from '../components/EdgeMLBrandLogo/EdgeMLBrandLogo.js';

class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userMail: '',
      password: '',
      token: '',
      buttonDisabled: false,
      isLoggedIn: false,
      time: undefined,
      loginFailed: false,
      show2FA: false,
    };
    this.baseState = JSON.parse(JSON.stringify(this.state));
    this.emailChange = this.emailChange.bind(this);
    this.passChange = this.passChange.bind(this);
    this.submit = this.submit.bind(this);
    this.onTokenChanged = this.onTokenChanged.bind(this);
    this.onLoginCanceled = this.onLoginCanceled.bind(this);
    this.passHandleKey = this.passHandleKey.bind(this);
    this.tick = this.tick.bind(this);
    this.checkLoggedInStatus = this.checkLoggedInStatus.bind(this);
    this.onLoginError = this.onLoginError.bind(this);
    this.register = this.register.bind(this);
    this.refreshThreshold = 5 * 60 * 1000 + 10 * 1000; // 5 minutes + 10 seconds offset
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.isLoggedIn !== this.props.isLoggedIn) {
      const tmpBase = this.baseState;
      tmpBase.isLoggedIn = this.props.isLoggedIn;
      this.setState(tmpBase);
    }
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
        this.props.onUserLoggedIn(
          accessToken,
          refreshToken,
          decoded.email,
          decoded.twoFactorEnabled,
          decoded.userName
        );
        this.setState({
          isLoggedIn: true,
        });
      }
    }
    // check whether the access token expires in 5 minutes and 10 seconds
    if (
      refreshToken &&
      jwt_decode(accessToken).exp * 1000 - Date.now() <= this.refreshThreshold
    ) {
      loginUserRefresh(refreshToken)
        .then((res) => {
          const refreshedAccessToken = 'Bearer ' + res.access_token;
          const decoded = jwt_decode(refreshedAccessToken);
          console.log(refreshedAccessToken);
          setToken(refreshedAccessToken, refreshToken);
          this.props.onUserLoggedIn(
            refreshedAccessToken,
            refreshToken,
            decoded.email,
            decoded.twoFactorEnabled,
            decoded.userName,
            decoded.subscriptionLevel
          );
        })
        .catch((err) => {
          console.log(err);
        });
      return;
    }
  }

  emailChange(event) {
    this.setState(
      update(this.state, {
        $merge: {
          userMail: event.target.value,
        },
      })
    );
  }

  passChange(event) {
    this.setState(
      update(this.state, {
        $merge: {
          password: event.target.value,
        },
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
      token: e.target.value,
    });
    if (!e.target || !e.target.value) return;
    if (e.target.value.length === 6) {
      verify2FA(e.target.value)
        .then((data) => {
          if (data.isTwoFactorAuthenticated) {
            this.props.onUserLoggedIn(data.access_token, data.refresh_token);
            this.setState({
              isLoggedIn: true,
            });
          }
        })
        .catch((err) => {
          this.onLoginError();
        });
    }
  }

  onLoginCanceled() {
    this.setState(this.baseState);
  }

  submit() {
    this.setState({ buttonDisabled: true });
    loginUser(this.state.userMail, this.state.password)
      .then((data) => {
        const decoded = jwt_decode(data.access_token);
        setToken(data.access_token, data.refresh_token);
        if (!data.twoFactorEnabled) {
          this.props.onUserLoggedIn(
            data.access_token,
            data.refresh_token,
            decoded.email,
            decoded.twoFactorEnabled,
            decoded.userName
          );
          this.setState({
            isLoggedIn: true,
            buttonDisabled: false,
            password: '',
            userMail: '',
          });
        } else {
          this.setState({
            show2FA: true,
          });
        }
      })
      .catch((err) => {
        console.log('Error');
        console.log(err);
        this.onLoginError();
      });
  }

  register() {
    window.location.href = './register';
  }

  onLoginError() {
    this.setState(
      {
        loginFailed: true,
      },
      () => {
        //Wait for animation to stop then reset page
        setTimeout(() => {
          this.setState({
            loginFailed: false,
            buttonDisabled: false,
            password: '',
            token: '',
          });
        }, 300);
      }
    );
  }

  componentDidMount() {
    this.checkLoggedInStatus();
    getServerTime()
      .then((serverTime) => this.setState({ time: serverTime }))
      .catch((err) => {});
    this.interval = setInterval(this.tick, 1000);
    this.checkLoggedInInterval = setInterval(() => {
      this.checkLoggedInStatus();
    }, this.refreshThreshold - 10 * 1000); // check every 5 minutes
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
            paddingRight: 0,
            background:
              'linear-gradient(0deg, rgba(11, 12, 89, 1) 0%, rgba(7, 55, 99, 1) 100%)',
          }}
        >
          <Alert color="info" hidden={!this.state.show2FA}>
            Your device's time must be synchronized with the server time or
            otherwise your token might be rejected. The current server time is:{' '}
            <b>{this.state.time ? this.state.time.toLocaleString() : ''}</b>
          </Alert>
          <Row>
            <Col className="login" xs={11} sm={6} lg={4}>
              <Fade duration="0.3s" playState="running">
                <Card
                  style={
                    this.state.loginFailed
                      ? {
                          animation:
                            'hzejgT 0.3s ease 0s 1 normal none running',
                          marginBottom: -120,
                        }
                      : {
                          marginBottom: -120,
                        }
                  }
                >
                  <CardHeader
                    hidden={this.state.show2FA}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <EdgeMLBrandLogo></EdgeMLBrandLogo>
                  </CardHeader>
                  <CardBody hidden={this.state.show2FA}>
                    <Row>
                      <Col>
                        <Col>
                          <InputGroup>
                            <InputGroupAddon addonType="prepend">
                              <InputGroupText style={{ background: '#ced4da' }}>
                                <PersonIcon fill="#444" width="15" />
                              </InputGroupText>
                            </InputGroupAddon>

                            <Input
                              type="email"
                              name="email"
                              id="email"
                              placeholder="email or username"
                              value={this.state.userMail}
                              onChange={this.emailChange}
                            />
                          </InputGroup>
                        </Col>
                        <Col>
                          <InputGroup>
                            <InputGroupAddon addonType="prepend">
                              <InputGroupText style={{ background: '#ced4da' }}>
                                <ShieldIcon fill="#444" width="15" />
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
                            className="btn-success"
                          >
                            Login
                          </Button>
                        </Col>
                        <Col className="my-2">
                          <hr
                            style={{
                              marginTop: 25,
                              marginBottom: 25,
                            }}
                          />
                          Have no account?
                          <Button
                            color="secondary"
                            style={{
                              marginTop: 10,
                            }}
                            onClick={this.register}
                            block
                          >
                            Register
                          </Button>
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
                      id="loginCancelBtn"
                      block
                      onClick={this.onLoginCanceled}
                      className={'mt-2'}
                    >
                      Cancel
                    </Button>
                  </CardBody>
                </Card>
              </Fade>
            </Col>
          </Row>
        </Container>
      );
    }
  }
}
export default LoginPage;
