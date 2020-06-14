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

import { logout } from './services/SocketService';

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
      playButtonEnabled: false
    };

    this.logoutHandler = this.logoutHandler.bind(this);
    this.onLogout = this.onLogout.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.onTwoFA = this.onTwoFA.bind(this);
    this.toggleNavbar = this.toggleNavbar.bind(this);
    this.toggleVideoOptions = this.toggleVideoOptions.bind(this);
    this.getVideoOptions = this.getVideoOptions.bind(this);
  }

  onLogout(didSucceed) {
    if (didSucceed) {
      this.setState({
        isLoggedIn: false,
        isTwoFactorAuthenticated: false
      });
    }
  }

  onLogin(didSucceed) {
    if (didSucceed) {
      this.setState({
        isLoggedIn: true,
        isTwoFactorAuthenticated: this.state.isTwoFactorAuthenticated
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
    logout(this.onLogout);
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
      >
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
          <Route exact path="/list" component={ListPage} />
          <Route exact path="/labelings" component={LabelingsPage} />
          <Route exact path="/labelings/new" component={LabelingsPage} />
          <Route exact path="/" component={ListPage} />
          <Route
            path="/datasets/:id"
            render={props => (
              <DatasetPage {...props} getVideoOptions={this.getVideoOptions} />
            )}
          />
          <Route exact path="/experiments" component={ExperimentsPage} />
          <Route exact path="/experiments/new" component={ExperimentsPage} />
          <Route
            exact
            path="/settings"
            render={props => (
              <SettingsPage
                {...props}
                onLogout={this.logoutHandler}
                onVideoOptionsChange={this.toggleVideoOptions}
                getVideoOptions={this.getVideoOptions}
              />
            )}
          />
        </Container>
      </AuthWall>
    );
  }
}

export default App;
