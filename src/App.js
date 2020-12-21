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
  NavbarToggler,
  DropdownItem,
  Dropdown,
  DropdownToggle,
  DropdownMenu
} from 'reactstrap';
import { Route, Link } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import './App.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

import AuthWall from './routes/login';
import RegisterPage from './routes/register';
import ListPage from './routes/list';
import DatasetPage from './routes/dataset';
import LabelingsPage from './routes/labelings';
import SettingsPage from './routes/settings';
import ExperimentsPage from './routes/experiments';
import ErrorPage from './components/ErrorPage/ErrorPage';
import ApiConstants from './services/ApiServices/ApiConstants';
import {
  getProjects,
  updateProject
} from './services/ApiServices/ProjectService';
import EditProjectModal from './components/EditProjectModal/EditProjectModal';

const clearToken = require('./services/LocalStorageService').clearToken;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        access_token: undefined
      },
      isLoggedIn: false,
      isTwoFactorAuthenticated: false,
      navbarState: {
        isOpen: false
      },
      videoEnaled: false,
      playButtonEnabled: false,
      currentUserMail: undefined,
      projects: [],
      currentproject: undefined,
      projectsOpen: false,
      projectEditModalOpen: false
    };
    this.logoutHandler = this.logoutHandler.bind(this);
    this.onLogout = this.onLogout.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.toggleNavbar = this.toggleNavbar.bind(this);
    this.toggleVideoOptions = this.toggleVideoOptions.bind(this);
    this.getVideoOptions = this.getVideoOptions.bind(this);
    this.setAccessToken = this.setAccessToken.bind(this);
    this.getCurrentUserMail = this.getCurrentUserMail.bind(this);
    this.setCurrentUserMail = this.setCurrentUserMail.bind(this);
    this.setUser = this.setUser.bind(this);
    this.toggleProjects = this.toggleProjects.bind(this);
    this.onProjectClick = this.onProjectClick.bind(this);
    this.onProjectEditModal = this.onProjectEditModal.bind(this);
    this.onProjectModalClose = this.onProjectModalClose.bind(this);
    this.onProjectChanged = this.onProjectChanged.bind(this);
  }

  onProjectChanged(project) {
    var projects = [...this.state.projects];
    var idx = projects.findIndex(elm => elm._id === project._id);
    projects[idx] = project;
    this.setState({
      projects: projects,
      projectEditModalOpen: false
    });
  }

  onProjectModalClose() {
    this.setState({
      projectEditModalOpen: false
    });
  }

  onProjectEditModal() {
    this.setState({
      projectEditModalOpen: true
    });
  }

  onProjectClick(index) {
    this.setState({
      currentProject: index
    });
  }

  toggleProjects() {
    this.setState({
      projectsOpen: !this.state.projectsOpen
    });
  }

  componentDidMount() {
    getProjects().then(projects => {
      if (projects.length === 0) return;
      this.setState({
        projects: projects,
        currentProject: 0
      });
    });
  }

  setUser(currentUser, callback) {
    this.setState(
      {
        user: { ...this.state.user, ...currentUser },
        isLoggedIn: true
      },
      () => {
        if (callback) {
          callback();
        }
      }
    );
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
    let tmpUser = { ...this.state.user };
    tmpUser.access_token = token;
    this.setState({
      user: tmpUser
    });
  }

  onLogout(didSucceed) {
    if (didSucceed) {
      clearToken();
      this.setState({
        user: {
          access_token: undefined
        },
        isLoggedIn: false,
        isTwoFactorAuthenticated: false
      });
    }
  }

  onLogin(didSucceed) {
    if (didSucceed) {
      this.setState({
        isLoggedIn: didSucceed
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
      <div>
        {this.state.projects[this.state.currentProject] ? (
          <EditProjectModal
            project={this.state.projects[this.state.currentProject]}
            isOpen={this.state.projectEditModalOpen}
            onClose={this.onProjectModalClose}
            projectChanged={this.onProjectChanged}
          ></EditProjectModal>
        ) : null}
        <Route
          exact
          path="/register"
          render={props => <RegisterPage {...props} />}
        />
        {this.props.history.location.pathname !== '/register' ? (
          <AuthWall
            isLoggedIn={this.state.isLoggedIn}
            isTwoFactorAuthenticated={this.state.isTwoFactorAuthenticated}
            onLogin={this.onLogin}
            onCancelLogin={this.logoutHandler}
            setAccessToken={this.setAccessToken}
            setCurrentUserMail={this.setCurrentUserMail}
            setUser={this.setUser}
            twoFactorEnabled={this.state.user.twoFactorEnabled}
            on2FA={this.on2FA}
          >
            {/* Only load these components when the access token is available else they gonna preload and cannot access api */}
            {this.state.isLoggedIn ? (
              <div>
                <Navbar color="light" light expand="md">
                  <NavbarBrand>Explorer</NavbarBrand>
                  <NavbarToggler onClick={this.toggleNavbar} />
                  <Collapse isOpen={this.state.navbarState.isOpen} navbar>
                    <Nav navbar className="mr-auto">
                      <NavItem
                        style={{ borderRight: '1px solid #000j' }}
                      ></NavItem>
                      <NavItem>
                        <div style={{ display: 'flex' }}>
                          <div style={{ display: 'block', margin: 'auto' }}>
                            <FontAwesomeIcon
                              onClick={this.onProjectEditModal}
                              style={{
                                color: '#8b8d8f',
                                float: 'left',
                                margin: 'auto',
                                cursor: 'pointer'
                              }}
                              icon={faCog}
                              className="mr-2 fa-s"
                            />
                          </div>
                          <Dropdown
                            className="navbar-dropdown"
                            style={{ float: 'right' }}
                            nav
                            inNavbar
                            isOpen={this.state.projectsOpen}
                            toggle={this.toggleProjects}
                          >
                            <DropdownToggle nav caret>
                              {this.state.projects[this.state.currentProject]
                                ? this.state.projects[this.state.currentProject]
                                    .name
                                : 'Loading'}
                            </DropdownToggle>
                            <DropdownMenu>
                              {this.state.projects.map((project, index) => {
                                return (
                                  <DropdownItem
                                    onClick={() => this.onProjectClick(index)}
                                    key={project._id}
                                  >
                                    {project.name}
                                  </DropdownItem>
                                );
                              })}
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      </NavItem>
                    </Nav>
                    <Nav navbar className="ml-auto">
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
                      <NavItem>
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
                      </NavItem>
                    </Nav>
                  </Collapse>
                </Navbar>

                <Container>
                  <Route
                    exact
                    path="/list"
                    render={props => <ListPage {...props} />}
                  />
                  <Route
                    exact
                    path="/labelings"
                    render={props => <LabelingsPage {...props} />}
                  />
                  <Route
                    exact
                    path="/labelings/new"
                    render={props => <LabelingsPage {...props} />}
                  />
                  <Route
                    exact
                    path="/"
                    render={props => <ListPage {...props} />}
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
                    render={props => <ExperimentsPage {...props} />}
                  />
                  <Route
                    exact
                    path="/experiments/new"
                    render={props => <ExperimentsPage {...props} />}
                  />
                  <Route
                    exact
                    path="/settings"
                    render={props => (
                      <SettingsPage
                        {...props}
                        getCurrentUserMail={this.getCurrentUserMail}
                        onLogout={this.logoutHandler}
                        onVideoOptionsChange={this.toggleVideoOptions}
                        getVideoOptions={this.getVideoOptions}
                        user={this.state.user}
                        setAccessToken={this.setAccessToken}
                        twoFactorEnabled={this.state.user.twoFactorEnabled}
                      />
                    )}
                  />
                  <Route
                    exact
                    path="/errorpage/:error/:errorText/:statusText"
                    render={props => <ErrorPage {...props} />}
                  />
                </Container>
              </div>
            ) : null}
          </AuthWall>
        ) : null}
      </div>
    );
  }
}

export default App;
