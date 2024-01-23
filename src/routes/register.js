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
  FormGroup,
  Label,
} from 'reactstrap';
import { MailIcon, PersonIcon, ShieldIcon } from 'react-octicons';
import { registerNewUser } from '../services/ApiServices/AuthentificationServices';
import { clearToken } from '../services/LocalStorageService';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { validateEmail } from '../services/helpers';
import EdgeMLBrandLogo from '../components/EdgeMLBrandLogo/EdgeMLBrandLogo';

class RegisterPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      passwordRepeat: '',
      userName: '',
      ToS_accepted: false,
      error: '',
    };
    this.onEMailChanged = this.onEMailChanged.bind(this);
    this.onPasswordChanged = this.onPasswordChanged.bind(this);
    this.onPasswordRepeatChanged = this.onPasswordRepeatChanged.bind(this);
    this.onError = this.onError.bind(this);
    this.onToS_checked = this.onToS_checked.bind(this);
    this.onRegisterClick = this.onRegisterClick.bind(this);
    this.onUserNameChanged = this.onUserNameChanged.bind(this);
  }

  onUserNameChanged(e) {
    this.setState({
      userName: e.target.value,
    });
  }

  onEMailChanged(e) {
    this.setState({
      email: e.target.value,
    });
  }

  onPasswordChanged(e) {
    this.setState({
      password: e.target.value,
    });
  }

  onPasswordRepeatChanged(e) {
    this.setState({
      passwordRepeat: e.target.value,
    });
  }

  onError(err) {
    if (err.includes('email_1 dup key')) {
      err = 'E-Mail already exists';
    }

    if (err.includes('userName_1 dup key')) {
      err = 'Username already exists';
    }

    this.setState({
      error: err,
    });
  }

  onToS_checked() {
    this.setState({
      ToS_accepted: !this.state.ToS_accepted,
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
      registerNewUser(
        this.state.email,
        this.state.password,
        this.state.userName
      )
        .then(() => {
          clearToken();
          this.setState({
            error: '',
          });
          this.props.history.push({
            pathname: '/',
            search: '',
          });
        })
        .catch((err) => {
          this.onError(err);
        });
    }
  }

  render() {
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
        <Row>
          <Col className="login" xs={11} sm={6} lg={4}>
            <Card
              style={{
                marginBottom: -149,
              }}
            >
              <CardHeader
                hidden={this.state.isLoggedIn}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <EdgeMLBrandLogo></EdgeMLBrandLogo>
              </CardHeader>
              <CardBody hidden={this.state.isLoggedIn}>
                <Row>
                  <Col>
                    <Col>
                      <InputGroup>
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <MailIcon fill="#444" width="15" />
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
                            <ShieldIcon fill="#444" width="15" />
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
                            <ShieldIcon fill="#444" width="15" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          type="password"
                          name="password"
                          id="passwordRepeat"
                          placeholder="repeat password"
                          onChange={this.onPasswordRepeatChanged}
                        />
                      </InputGroup>
                    </Col>
                    <Col>
                      <InputGroup>
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <PersonIcon fill="#444" width="15" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          type="text"
                          name="username"
                          id="username"
                          placeholder="username"
                          onChange={this.onUserNameChanged}
                        />
                      </InputGroup>
                    </Col>
                    <Col
                      style={{
                        paddingBottom: '10px',
                        textAlign: 'left',
                      }}
                    >
                      <FormGroup
                        check
                        style={{
                          marginTop: 20,
                          marginBottom: 10,
                        }}
                      >
                        <Label check>
                          <Input
                            type="checkbox"
                            onChange={this.onToS_checked}
                          />{' '}
                          I have read and agree to the{' '}
                          <a href="/terms_of_service.html" target="_blank">
                            terms of service
                          </a>{' '}
                          .
                        </Label>
                      </FormGroup>
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
                        <div style={{ color: 'red', display: 'inline-block' }}>
                          {' '}
                          {this.state.error}
                        </div>
                      </Col>
                    ) : null}
                    <Col>
                      <Button
                        id="registerButton"
                        color="success"
                        block
                        onClick={this.onRegisterClick}
                        disabled={!this.state.ToS_accepted}
                        style={{
                          marginBottom: 10,
                        }}
                      >
                        Register
                      </Button>
                    </Col>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}
export default RegisterPage;
