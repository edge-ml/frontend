import React, { Component } from 'react';
import {
  Container,
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  Button,
  Form,
  Collapse,
  NavbarToggler
} from 'reactstrap';
import { Route, Link } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import './App.css';

import AuthWall from './routes/login';
import ListPage from './routes/list';
import DatasetPage from './routes/dataset';
import LabelingsPage from './routes/labelings';
import SettingsPage from './routes/settings';
import ExperimentsPage from './routes/experiments';

import { access } from 'fs';
import { rejects } from 'assert';
import { subscribeUsers } from './services/ApiServices/AuthentificationServices';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoggedIn: false,
      isTwoFactorAuthenticated: false,
      navbarState: {
        isOpen: false
      },
      videoEnaled: false,
      playButtonEnabled: false,
      accessToken: undefined,
      currentUserMail: undefined
    };

    this.logoutHandler = this.logoutHandler.bind(this);
    this.onLogout = this.onLogout.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.onTwoFA = this.onTwoFA.bind(this);
    this.toggleNavbar = this.toggleNavbar.bind(this);
    this.toggleVideoOptions = this.toggleVideoOptions.bind(this);
    this.getVideoOptions = this.getVideoOptions.bind(this);
    this.setAccessToken = this.setAccessToken.bind(this);
    this.getCurrentUserMail = this.getCurrentUserMail.bind(this);
    this.setCurrentUserMail = this.setCurrentUserMail.bind(this);
  }

  getCurrentUserMail() {
    return this.state.currentUserMail;
  }

  setCurrentUserMail(currentUserMail) {
    this.setState({
      currentUserMail: currentUserMail
    });
  }

  async setAccessToken(token) {
    this.setState({
      accessToken: token
    });
  }

  onLogout(didSucceed) {
    if (didSucceed) {
      this.setState({
        isLoggedIn: false,
        isTwoFactorAuthenticated: false,
        accessToken: undefined
      });
    }
  }

  onLogin(didSucceed) {
    if (didSucceed) {
      this.setState({
        isLoggedIn: true,
        isTwoFactorAuthenticated: true //Disabled 2FA
      });
    }
  }

  onTwoFA(success) {
    if (success) {
      this.setState({
        isLoggedIn: success,
        isTwoFactorAuthenticated: success
      });
    }
  }

  logoutHandler() {
    this.onLogout(true);
  }

  toggleNavbar() {
    this.setState({
      navbarState: {
        isOpen: !this.state.navbarState.isOpen
      }
    });
  }

  toggleVideoOptions(videoStatus, playButtonStatus) {
    this.setState({
      videoEnaled: videoStatus,
      playButtonEnabled: playButtonStatus
    });
  }

  getVideoOptions() {
    return {
      videoEnabled: this.state.videoEnaled,
      playButtonEnabled: this.state.playButtonEnabled
    };
  }

  render() {
    return (
      <AuthWall
        isLoggedIn={this.state.isLoggedIn}
        isTwoFactorAuthenticated={this.state.isTwoFactorAuthenticated}
        onLogin={this.onLogin}
        onTwoFA={this.onTwoFA}
        onCancelLogin={this.logoutHandler}
        setAccessToken={this.setAccessToken}
        setCurrentUserMail={this.setCurrentUserMail}
      >
        {/* Only load these components when the access token is available else they gonna preload and cannot access api */}
        {this.state.isLoggedIn ? (
          <div>
            <Navbar color="light" light expand="md">
              <NavbarBrand>Explorer</NavbarBrand>
              <NavbarToggler onClick={this.toggleNavbar} />
              <Collapse isOpen={this.state.navbarState.isOpen} navbar>
                <Nav className="ml-auto" navbar>
                  <NavItem>
                    <Link className="nav-link" to="/list">
                      Datasets
                    </Link>
                  </NavItem>
                  <NavItem>
                    <Link className="nav-link" to="/labelings">
                      Labelings
                    </Link>
                  </NavItem>
                  <NavItem>
                    <Link className="nav-link" to="/experiments">
                      Experiments
                    </Link>
                  </NavItem>
                  <NavItem>
                    <Link className="nav-link" to="/settings">
                      Settings
                    </Link>
                  </NavItem>
                  <Form className="form-inline my-2 my-lg-0">
                    <Link
                      className="nav-link m-0 p-0 ml-3"
                      to="/"
                      onClick={this.logoutHandler}
                    >
                      <Button className="m-0 my-2 my-sm-0" outline>
                        Logout
                      </Button>
                    </Link>
                  </Form>
                  <NavItem />
                </Nav>
              </Collapse>
            </Navbar>
            <Container>
              <Route
                exact
                path="/list"
                render={props => (
                  <ListPage accessToken={this.state.accessToken} />
                )}
              />
              <Route
                exact
                path="/labelings"
                render={props => (
                  <LabelingsPage
                    {...props}
                    accessToken={this.state.accessToken}
                  />
                )}
              />
              <Route
                exact
                path="/labelings/new"
                render={props => (
                  <LabelingsPage
                    {...props}
                    accessToken={this.state.accessToken}
                  />
                )}
              />
              <Route
                exact
                path="/"
                render={props => (
                  <ListPage accessToken={this.state.accessToken} />
                )}
              />
              <Route
                path="/datasets/:id"
                render={props => (
                  <DatasetPage
                    {...props}
                    getVideoOptions={this.getVideoOptions}
                  />
                )}
              />
              <Route
                exact
                path="/experiments"
                render={props => (
                  <ExperimentsPage
                    {...props}
                    accessToken={this.state.accessToken}
                  />
                )}
              />
              <Route
                exact
                path="/experiments/new"
                render={props => (
                  <ExperimentsPage
                    {...props}
                    accessToken={this.state.accessToken}
                  />
                )}
              />
              <Route
                exact
                path="/settings"
                render={props => (
                  <SettingsPage
                    {...props}
                    getCurrentUserMail={this.getCurrentUserMail}
                    accessToken={this.state.accessToken}
                    onLogout={this.logoutHandler}
                    onVideoOptionsChange={this.toggleVideoOptions}
                    getVideoOptions={this.getVideoOptions}
                  />
                )}
              />
            </Container>
          </div>
        ) : null}
      </AuthWall>
    );
  }
}

export default App;
