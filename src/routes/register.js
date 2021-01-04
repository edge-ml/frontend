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
import { MailIcon, ShieldIcon } from 'react-octicons';
import { FadeInUp } from 'animate-components';
import { registerNewUser } from '../services/ApiServices/AuthentificationServices';
import { clearToken } from '../services/LocalStorageService';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { validateEmail } from '../services/helpers';

class RegisterPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      passwordRepeat: '',
      error: ''
    };
    this.onEMailChanged = this.onEMailChanged.bind(this);
    this.onPasswordChanged = this.onPasswordChanged.bind(this);
    this.onPasswordRepeatChanged = this.onPasswordRepeatChanged.bind(this);
    this.onError = this.onError.bind(this);
    this.onRegisterClick = this.onRegisterClick.bind(this);
  }

  onEMailChanged(e) {
    this.setState({
      email: e.target.value
    });
  }

  onPasswordChanged(e) {
    this.setState({
      password: e.target.value
    });
  }

  onPasswordRepeatChanged(e) {
    this.setState({
      passwordRepeat: e.target.value
    });
  }

  onError(err) {
    if (err.includes('E11000 duplicate key error collection')) {
      err = 'E-Mail already exists';
    }
    this.setState({
      error: err
    });
  }

  onRegisterClick() {
    if (!validateEmail(this.state.email)) {
      this.onError('Enter a valid E-mail');
    } else if (this.state.password === '') {
      this.onError('Enter a password');
    } else if (this.state.password !== this.state.passwordRepeat) {
      this.onError('The passwords have to match');
    } else {
      registerNewUser(this.state.email, this.state.password)
        .then(() => {
          clearToken();
          this.setState({
            error: ''
          });
          this.props.history.push({
            pathname: '/',
            search: ''
          });
        })
        .catch(err => {
          console.log(err);
          this.onError(err.response.data.error);
        });
    }
  }

  render() {
    return (
      <Container
        className="Page"
        style={{
          paddingLeft: 0,
          paddingRight: 0
        }}
      >
        <Row>
          <Col className="login" xs={11} sm={6} lg={4}>
            <FadeInUp duration="0.3s" playState="running">
              <Card>
                <CardHeader hidden={this.state.isLoggedIn}>
                  <b>Explorer Registration</b>
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
                            onChange={this.onEMailChanged}
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
                            onChange={this.onPasswordChanged}
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
                            id="passwordRepeat"
                            placeholder="Repeat password"
                            onChange={this.onPasswordRepeatChanged}
                          />
                        </InputGroup>
                      </Col>
                      {this.state.error ? (
                        <Col
                          className="my-1"
                          style={{ paddingRight: '15px', paddingLeft: '15px' }}
                        >
                          <FontAwesomeIcon
                            style={{ color: 'red' }}
                            icon={faExclamationTriangle}
                            className="mr-2 fa-xs"
                            data-tip="Error"
                            id="errorIcon"
                          />
                          <div
                            style={{ color: 'red', display: 'inline-block' }}
                          >
                            {' '}
                            {this.state.error}
                          </div>
                        </Col>
                      ) : null}
                      <Col>
                        <Button
                          id="registerButton"
                          color="primary"
                          block
                          onClick={this.onRegisterClick}
                        >
                          Register
                        </Button>
                      </Col>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </FadeInUp>
          </Col>
        </Row>
      </Container>
    );
  }
}
export default RegisterPage;
