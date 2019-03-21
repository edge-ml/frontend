import React, { Component } from 'react';
import {
  Container,
  Col,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Button
} from 'reactstrap';
import { PersonIcon, ShieldIcon } from 'react-octicons';
import { view } from 'react-easy-state';
import Request from 'request-promise';
import update from 'immutability-helper';

import State from '../state';

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
      authed: false
    };
    this.userChange = this.userChange.bind(this);
    this.passChange = this.passChange.bind(this);
    this.submit = this.submit.bind(this);
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

    const options = {
      method: 'POST',
      url: `${State.auth0}/oauth/token`,
      form: {
        grant_type: 'password',
        client_id: '4uE1DwK5BtnyInN14LO0Lb42NXtr5MHC',
        username: this.state.username,
        password: this.state.password,
        scope: 'openid'
      }
    };

    Request(options)
      .then(res => {
        const response = JSON.parse(res);
        window.localStorage.setItem('id_token', response.id_token);
        this.setState(
          update(this.state, {
            authed: { $set: true }
          })
        );
      })
      .catch(err => {
        this.setState(
          update(this.state, {
            authed: { $set: false }
          })
        );
      });
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
          <div className="login">
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
              >
                Login
              </Button>
            </Col>
          </div>
        </Container>
      );
    }
  }
}

export default view(LoginPage);
