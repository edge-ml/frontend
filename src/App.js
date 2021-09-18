import React, { Component } from 'react';
import { NavbarBrand, Nav, NavItem, Button } from 'reactstrap';
import { Route, NavLink } from 'react-router-dom';
import CustomDropDownMenu from './components/CustomDropDownMenu/CustomDropDownMenu';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faPlus, faUser } from '@fortawesome/free-solid-svg-icons';

import AuthWall from './routes/login';
import RegisterPage from './routes/register';
import { getProjects } from './services/ApiServices/ProjectService';
import EditProjectModal from './components/EditProjectModal/EditProjectModal';
import {
  setProject,
  getProject,
  clearToken,
  setToken,
  clearProject
} from './services/LocalStorageService';
import UserSettingsModal from './components/UserSettingsModal/UserSettingsModal';
import AppContent from './AppContent';
import NoProjectPage from './components/NoProjectPage/NoProjectPage';
import ErrorPage from './components/ErrorPage/ErrorPage';
import { Right } from 'react-bootstrap/lib/Media';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userMail: undefined,
      userName: undefined,
      isLoggedIn: false,
      twoFAEnabled: false,
      videoEnaled: false,
      playButtonEnabled: false,
      currentUserMail: undefined,
      projects: undefined,
      currentProject: undefined,
      projectsOpen: false,
      projectEditModalOpen: false,
      projectEditModalNew: false,
      userSettingsModalOpen: false,
      navbarWidth: '160px'
    };
    this.baseState = JSON.parse(JSON.stringify(this.state));
    this.logoutHandler = this.logoutHandler.bind(this);
    this.onLogout = this.onLogout.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.toggleVideoOptions = this.toggleVideoOptions.bind(this);
    this.setAccessToken = this.setAccessToken.bind(this);
    this.getCurrentUserMail = this.getCurrentUserMail.bind(this);
    this.setCurrentUserMail = this.setCurrentUserMail.bind(this);
    this.toggleProjects = this.toggleProjects.bind(this);
    this.onProjectClick = this.onProjectClick.bind(this);
    this.onProjectEditModal = this.onProjectEditModal.bind(this);
    this.onProjectModalClose = this.onProjectModalClose.bind(this);
    this.onProjectsChanged = this.onProjectsChanged.bind(this);
    this.refreshProjects = this.refreshProjects.bind(this);
    this.toggleUserSettingsModal = this.toggleUserSettingsModal.bind(this);
    this.onUserLoggedIn = this.onUserLoggedIn.bind(this);
    this.enable2FA = this.enable2FA.bind(this);
    this.changeURL = this.changeURL.bind(this);
    this.navigateTo = this.navigateTo.bind(this);
  }

  changeURL(project) {
    const splitUrl = this.props.history.location.pathname
      .split('/')
      .filter(elm => elm !== '');
    console.log(splitUrl);
    splitUrl[0] = project.admin.userName;
    splitUrl[1] = project.name;
    this.props.history.push('/' + splitUrl.join('/'));
  }

  navigateTo(location) {
    const project = this.state.projects[this.state.currentProject];
    this.props.history.push(
      '/' + project.admin.userName + '/' + project.name + '/' + location
    );
  }

  enable2FA() {
    this.setState({
      twoFAEnabled: true
    });
  }

  toggleUserSettingsModal() {
    this.setState({
      userSettingsModalOpen: !this.state.userSettingsModalOpen
    });
  }

  onProjectsChanged(projects, index) {
    if (projects.length === 0) {
      this.props.history.push('/');
      this.setState({
        projects: [],
        currentProject: -1,
        projectEditModalOpen: false
      });
      clearProject();
      return;
    }
    const projectIndex = index <= projects.length && index >= 0 ? index : 0;
    setProject(projects[projectIndex]._id);
    this.setState({
      projects: projects,
      currentProject: projectIndex,
      projectEditModalOpen: false
    });
    this.changeURL(this.state.projects[projectIndex]);
  }

  onProjectModalClose() {
    this.setState({
      projectEditModalOpen: false
    });
  }

  onProjectEditModal(isNew) {
    this.setState({
      projectEditModalOpen: true,
      projectEditModalNew: isNew
    });
  }

  onProjectClick(index) {
    setProject(this.state.projects[index]._id);
    this.setState({
      currentProject: index
    });

    this.changeURL(this.state.projects[index]);
  }

  toggleProjects() {
    this.setState({
      projectsOpen: !this.state.projectsOpen
    });
  }

  refreshProjects() {
    getProjects()
      .then(projects => {
        if (projects.length === 0) {
          this.setState({
            projects: []
          });
          this.props.history.push('/');
          return;
        }
        //Check if url contains useful information
        const params = this.props.history.location.pathname.split('/');
        const projectIndex = projects.findIndex(elm => elm.name === params[2]);
        if (projectIndex !== -1) {
          this.setState({
            projects: projects,
            currentProject: projectIndex
          });
          this.props.history.push(
            '/' +
              projects[projectIndex].admin.userName +
              '/' +
              projects[projectIndex].name +
              '/' +
              params.slice(3).join('/')
          );
          return;
        }

        var currentProject = projects.findIndex(
          elm => elm._id === getProject()
        );
        if (currentProject === -1) {
          currentProject = 0;
          setProject(projects[0]._id);
        } else {
          setProject(projects[currentProject]._id);
        }
        this.setState({
          projects: projects,
          currentProject: currentProject
        });
        this.props.history.push(
          '/' +
            projects[currentProject].admin.userName +
            '/' +
            projects[currentProject].name +
            '/datasets'
        );
      })
      .catch(errorStatus => {
        if (errorStatus) {
          this.onLogout(true);
        } else {
          this.props.history.push('/errorpage/Could not connect to Backend');
        }
      });
  }

  onUserLoggedIn(accessToken, refreshToken, userMail, twoFAEnabled, userName) {
    setToken(accessToken, refreshToken);
    this.setState({
      userMail: userMail ? userMail : this.state.userMail,
      userName: userName ? userName : this.state.userName,
      twoFAEnabled: twoFAEnabled ? twoFAEnabled : this.state.twoFAEnabled,
      isLoggedIn: true
    });
    this.refreshProjects();
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
      this.props.history.push('/');
      this.setState(this.baseState);
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

  toggleVideoOptions(videoStatus, playButtonStatus) {
    this.setState({
      videoEnaled: videoStatus,
      playButtonEnabled: playButtonStatus
    });
  }

  render() {
    const projectAvailable = this.state.projects
      ? this.state.projects[this.state.currentProject]
      : undefined;
    return (
      <div>
        <EditProjectModal
          project={
            this.state.projects
              ? this.state.projects[this.state.currentProject]
              : undefined
          }
          isOpen={this.state.projectEditModalOpen}
          isNewProject={this.state.projectEditModalNew}
          userName={this.state.userName}
          onClose={this.onProjectModalClose}
          projectChanged={this.onProjectsChanged}
        ></EditProjectModal>
        <Route
          exact
          path="/register"
          render={props => <RegisterPage {...props} />}
        />
        <Route
          path={'/errorpage/:error/:errorText?/:statusText?'}
          render={props => <ErrorPage {...props} />}
        />
        {!this.props.history.location.pathname.includes('/register') ? (
          <AuthWall
            isLoggedIn={this.state.isLoggedIn}
            onLogin={this.onLogin}
            onCancelLogin={this.logoutHandler}
            setAccessToken={this.setAccessToken}
            setCurrentUserMail={this.setCurrentUserMail}
            setUser={this.setUser}
            onUserLoggedIn={this.onUserLoggedIn}
            on2FA={this.on2FA}
          >
            {/* Only load these components when the access token is available else they gonna preload and cannot access api */}
            {this.state.isLoggedIn && this.state.projects ? (
              <div className="d-flex">
                <div
                  className="d-flex flex-column"
                  color="light"
                  style={{
                    width: this.state.navbarWidth,
                    position: 'fixed',
                    height: '100vh',
                    zIndex: '100'
                  }}
                >
                  <NavbarBrand
                    style={{ marginRight: '8px' }}
                    className="dark-hover"
                  >
                    <a
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: 'none'
                      }}
                      href={
                        '/' +
                        projectAvailable.admin.userName +
                        '/' +
                        projectAvailable.name +
                        '/' +
                        'datasets'
                      }
                    >
                      <img
                        style={{ marginRight: '8px', width: '32px' }}
                        src={require('./logo.svg')}
                      />
                      <b>
                        <div style={{ color: 'black' }}>edge-ml</div>
                      </b>
                    </a>
                  </NavbarBrand>
                  <div className="d-flex flex-column">
                    <Nav navbar className="mr-auto">
                      <NavItem>
                        <CustomDropDownMenu
                          left
                          content={
                            <div
                              style={{ display: 'inline-flex', padding: '8px' }}
                            >
                              <div id="currentProjectName">
                                {projectAvailable
                                  ? this.state.projects[
                                      this.state.currentProject
                                    ].name
                                  : this.state.projects.length === 0
                                  ? 'No projects'
                                  : 'Loading'}
                              </div>{' '}
                              <div
                                style={{ display: 'flex', marginLeft: '4px' }}
                              >
                                <FontAwesomeIcon
                                  style={{
                                    color: '#8b8d8f',
                                    float: 'left',
                                    margin: 'auto',
                                    cursor: 'pointer'
                                  }}
                                  icon={faCaretDown}
                                  className="mr-2 fa-s"
                                ></FontAwesomeIcon>
                              </div>
                            </div>
                          }
                        >
                          {this.state.projects.map((project, index) => {
                            return (
                              <div
                                className="dropDownItem"
                                onClick={() => this.onProjectClick(index)}
                                key={project._id}
                              >
                                {project.name}
                              </div>
                            );
                          })}
                        </CustomDropDownMenu>
                      </NavItem>
                      <div style={{ display: 'block', margin: 'auto' }}>
                        <FontAwesomeIcon
                          id="btnAddProject"
                          onClick={() => this.onProjectEditModal(true)}
                          style={{
                            color: '#8b8d8f',
                            float: 'left',
                            margin: 'auto',
                            cursor: 'pointer'
                          }}
                          icon={faPlus}
                          className="mr-2 fa-s"
                        />
                      </div>
                    </Nav>
                    <Nav navbar className="d-flex flex-column">
                      {projectAvailable ? (
                        <div>
                          <NavLink
                            id="navLinkDatasets"
                            className="nav-link"
                            exact={false}
                            to={
                              '/' +
                              projectAvailable.admin.userName +
                              '/' +
                              projectAvailable.name +
                              '/datasets'
                            }
                          >
                            Datasets
                          </NavLink>
                          <NavLink
                            id="navLinkLabelings"
                            className="nav-link"
                            to={
                              '/' +
                              projectAvailable.admin.userName +
                              '/' +
                              projectAvailable.name +
                              '/labelings'
                            }
                          >
                            Labelings
                          </NavLink>
                          <NavLink
                            id="navLinkML"
                            className="nav-link"
                            to={
                              '/' +
                              projectAvailable.admin.userName +
                              '/' +
                              projectAvailable.name +
                              '/ml'
                            }
                          >
                            ML
                          </NavLink>

                          <NavLink
                            id="navLinkSettings"
                            className="nav-link"
                            to={
                              '/' +
                              projectAvailable.admin.userName +
                              '/' +
                              projectAvailable.name +
                              '/settings'
                            }
                          >
                            Settings
                          </NavLink>
                          <NavItem className="navbar-divider"> </NavItem>
                        </div>
                      ) : null}
                      <NavItem
                        className="my-auto"
                        style={{ paddingLeft: '8px' }}
                      >
                        <CustomDropDownMenu
                          right
                          noHover
                          content={
                            <FontAwesomeIcon
                              id="userDropDownContent"
                              style={{
                                color: '#8b8d8f',
                                float: 'left',
                                margin: 'auto',
                                cursor: 'pointer'
                              }}
                              icon={faUser}
                              className="mr-2 fa-s"
                            />
                          }
                        >
                          <div>
                            <div
                              style={{
                                textAlign: 'right',
                                width: 'max-content'
                              }}
                            >
                              Signed in as <b>{this.state.userName}</b>
                            </div>
                            <div
                              style={{
                                textAlign: 'right',
                                fontSize: 'smaller'
                              }}
                            >
                              {this.state.userMail}
                            </div>
                          </div>
                          <Button
                            outline
                            onClick={this.toggleUserSettingsModal}
                          >
                            User settings
                          </Button>
                          <Button
                            id="buttonLogoutUser"
                            className="m-0 my-2 my-sm-0"
                            outline
                            color="danger"
                            onClick={this.logoutHandler}
                          >
                            Logout
                          </Button>
                        </CustomDropDownMenu>
                        <UserSettingsModal
                          isOpen={this.state.userSettingsModalOpen}
                          onClose={this.toggleUserSettingsModal}
                          twoFAEnabled={this.state.twoFAEnabled}
                          onLogout={() => this.onLogout(true)}
                          enable2FA={this.enable2FA}
                          userMail={this.state.userMail}
                        ></UserSettingsModal>
                      </NavItem>
                    </Nav>
                  </div>
                </div>
                {projectAvailable ? null : (
                  <NoProjectPage
                    onCreateProject={e => {
                      e.preventDefault();
                      this.onProjectEditModal(this);
                    }}
                  ></NoProjectPage>
                )}
                <div
                  style={{ marginLeft: this.state.navbarWidth, widht: '100%' }}
                >
                  <Route
                    {...this.props}
                    path="/:userName/:projectID"
                    render={props => (
                      <AppContent
                        {...props}
                        project={this.state.projects[this.state.currentProject]}
                        onProjectsChanged={this.onProjectsChanged}
                        navigateTo={this.navigateTo}
                      />
                    )}
                  ></Route>
                </div>
              </div>
            ) : null}
          </AuthWall>
        ) : null}
      </div>
    );
  }
}

export default App;
