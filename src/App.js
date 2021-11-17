import React, { Component } from 'react';
import { NavbarBrand } from 'reactstrap';
import { Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretDown,
  faCaretRight,
  faPlus,
  faUser,
  faDatabase,
  faCogs,
  faPen,
  faBrain,
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';

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
import { deleteProject } from './services/ApiServices/ProjectService';

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
      currentProjectId: undefined,
      projectLocation: undefined,
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
    this.getNavBarItemClasses = this.getNavBarItemClasses.bind(this);
    this.onDeleteProject = this.onDeleteProject.bind(this);

    this.props.history.listen(() => {
      const splitUrl = this.props.history.location.pathname
        .split('/')
        .filter(elm => elm !== '');

      if (splitUrl[2] !== undefined) {
        this.setState({
          projectLocation: splitUrl[2] // handle changes of location from other places
        });
      }
    });
  }

  onDeleteProject(project) {
    deleteProject(project).then(data => {
      this.onProjectsChanged(data);
    });
  }

  changeURL(project) {
    if (project === undefined) {
      this.props.history.push('/');
      return;
    }

    const splitUrl = this.props.history.location.pathname
      .split('/')
      .filter(elm => elm !== '');
    splitUrl[0] = project.admin.userName;
    splitUrl[1] = project.name;
    this.props.history.push('/' + splitUrl.join('/'));
  }

  navigateTo(location) {
    const project = this.state.projects.filter(
      x => x._id === this.state.currentProjectId
    )[0];
    this.props.history.push(
      '/' + project.admin.userName + '/' + project.name + '/' + location
    );
    this.setState({
      projectLocation: location
    });
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
        currentProjectId: -1,
        projectEditModalOpen: false
      });
      clearProject();
      return;
    }

    var newProject = false;
    var projectIndex = projects.findIndex(
      elm => elm._id === this.state.currentProjectId
    );
    if (projectIndex === -1) {
      projectIndex = 0;
      newProject = true;
    }
    if (index) {
      projectIndex = index;
      newProject = true;
    }

    setProject(projects[projectIndex]._id);

    this.setState({
      projects: projects,
      currentProjectId: projects[projectIndex]._id,
      projectEditModalOpen: false,
      projectLocation: 'datasets'
    });
    this.changeURL(this.state.projects[projectIndex]);
    if (newProject) {
      this.navigateTo('datasets');
    }
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

  onProjectClick(id) {
    if (this.state.currentProjectId === id) {
      this.setState({
        currentProjectId: undefined
      });
      this.changeURL(undefined);
      return;
    }
    setProject(id);

    this.setState({
      currentProjectId: id
    });

    this.changeURL(this.state.projects.filter(x => x._id === id)[0]);
  }

  toggleProjects() {
    this.setState({
      projectsOpen: !this.state.projectsOpen
    });
  }

  getNavBarItemClasses(location) {
    const project = this.state.projects.filter(
      x => x._id === this.state.currentProjectId
    )[0];
    const isSelected =
      this.props.location.pathname ===
      '/' + project.admin.userName + '/' + project.name + '/' + location;
    return (
      'pt-2 pb-2 pl-4 small ' +
      (isSelected ? 'navbar-project-item-active' : 'navbar-project-item')
    );
  }

  refreshProjects() {
    getProjects()
      .then(projects => {
        // if no project is available
        if (projects.length === 0) {
          this.setState({
            projects: []
          });
          this.props.history.push('/');
          return;
        }

        // if the user comes to a url parse the name of the project from it
        const params = this.props.history.location.pathname.split('/');
        const projectIndex = projects.findIndex(elm => elm.name === params[2]);
        const retrievedProjectLocation = params[3];
        this.setState({
          projectLocation: retrievedProjectLocation
        });

        if (projectIndex !== -1) {
          this.setState({
            projects: projects,
            currentProjectId: projects[projectIndex]._id
          });
          setProject(projects[projectIndex]._id);
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

        // verify now project was openend last, otherwise start with first project open
        var storedProjectIndex = projects.findIndex(
          elm => elm._id === getProject()
        );

        if (storedProjectIndex === -1) {
          storedProjectIndex = 0;
        }

        this.setState({
          projects: projects,
          currentProjectId: undefined,
          projectLocation: undefined
        });

        this.props.history.push(
          '/' +
            projects[storedProjectIndex].admin.userName +
            '/' +
            projects[storedProjectIndex].name +
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
    var projectIndex = this.state.projects
      ? this.state.projects.findIndex(
          x => x._id === this.state.currentProjectId
        )
      : -1;
    const projectAvailable = this.state.projects
      ? this.state.projects[projectIndex]
      : undefined;

    const modalOpen =
      this.state.userSettingsModalOpen ||
      this.state.projectEditModalOpen ||
      this.state.userSettingsModalOpen;

    return (
      <div>
        <EditProjectModal
          project={
            this.state.projects ? this.state.projects[projectIndex] : undefined
          }
          isOpen={this.state.projectEditModalOpen}
          isNewProject={this.state.projectEditModalNew}
          userName={this.state.userName}
          onClose={this.onProjectModalClose}
          projectChanged={this.onProjectsChanged}
          userName={this.state.userName}
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
                  className="d-flex flex-column bg-light align-items-center justify-content-between shadow"
                  color="light"
                  style={{
                    width: this.state.navbarWidth,
                    position: 'fixed',
                    height: '100vh',
                    zIndex: '100'
                  }}
                >
                  <div className="w-100 d-flex flex-column justify-content-center align-items-center">
                    <NavbarBrand
                      style={{ marginRight: '8px' }}
                      className="dark-hover mt-2"
                    >
                      <a
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          textDecoration: 'none'
                        }}
                        href={
                          projectAvailable
                            ? '/' +
                              projectAvailable.admin.userName +
                              '/' +
                              projectAvailable.name +
                              '/' +
                              'datasets'
                            : null
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
                    <div className="w-100 mt-3">
                      {this.state.projects.map((project, index) => {
                        return (
                          <div className="w-100 text-left" key={project._id}>
                            <div
                              className="d-flex align-items-center mt-1 pt-2 pb-2 pl-2 navbar-project"
                              onClick={() => this.onProjectClick(project._id)}
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              <FontAwesomeIcon
                                style={{
                                  color: '#8b8d8f',
                                  float: 'left',
                                  cursor: 'pointer'
                                }}
                                icon={
                                  this.state.currentProjectId === project._id
                                    ? faCaretDown
                                    : faCaretRight
                                }
                                className="mr-2 fa-s"
                              ></FontAwesomeIcon>
                              <div
                                className="navbar-project pr-1"
                                style={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                <b>{project.name}</b>
                              </div>
                            </div>
                            {this.state.currentProjectId === project._id ? (
                              <div>
                                <div
                                  onClick={() => {
                                    this.navigateTo('datasets');
                                  }}
                                  className={this.getNavBarItemClasses(
                                    'datasets'
                                  )}
                                >
                                  <FontAwesomeIcon
                                    className="mr-2"
                                    icon={faDatabase}
                                  ></FontAwesomeIcon>
                                  Datasets
                                </div>
                                <div
                                  className={this.getNavBarItemClasses(
                                    'labelings'
                                  )}
                                  onClick={() => {
                                    this.navigateTo('labelings');
                                  }}
                                >
                                  <FontAwesomeIcon
                                    className="mr-2"
                                    icon={faPen}
                                  ></FontAwesomeIcon>
                                  Labelings
                                </div>
                                <div
                                  onClick={() => {
                                    this.navigateTo('model');
                                  }}
                                  className={this.getNavBarItemClasses('model')}
                                >
                                  <FontAwesomeIcon
                                    className="mr-2"
                                    icon={faBrain}
                                  ></FontAwesomeIcon>
                                  Models
                                </div>
                                <div
                                  onClick={() => {
                                    this.navigateTo('settings');
                                  }}
                                  className={this.getNavBarItemClasses(
                                    'settings'
                                  )}
                                >
                                  <FontAwesomeIcon
                                    className="mr-2"
                                    icon={faCogs}
                                  ></FontAwesomeIcon>
                                  Settings
                                </div>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>

                    <div
                      onClick={() => this.onProjectEditModal(true)}
                      style={{}}
                      className="w-100 mt-3 pt-2 pb-2 navbar-project text-center"
                      style={{
                        backgroundColor: '#eee',
                        border: '0px solid transparent',
                        color: '#666',
                        fontSize: '0.9rem'
                      }}
                    >
                      <FontAwesomeIcon
                        id="btnAddProject"
                        icon={faPlus}
                        className="fa-s mr-1"
                      />
                      Add Project
                    </div>
                  </div>
                  <div></div>
                  <div className="d-flex flex-column footer w-100 text-light justify-content-center align-items-center">
                    <div
                      className="pt-3 pb-3 navbar-project-item w-100 text-center"
                      onClick={() =>
                        window.open(
                          'https://github.com/edge-ml/edge-ml/wiki',
                          '_blank'
                        )
                      }
                    >
                      <small>
                        <FontAwesomeIcon icon={faLightbulb} className="mr-2" />
                        Documentation
                      </small>
                    </div>
                    <div
                      style={{
                        height: '1px',
                        backgroundColor: 'darkgray',
                        opacity: '0.3',
                        width: '95%'
                      }}
                    ></div>
                    <div
                      id="userProfileSettings"
                      className="d-flex flex-row justify-content-center navbar-project-item align-items-center pt-3 pb-3 w-100"
                      onClick={this.toggleUserSettingsModal}
                    >
                      <div
                        style={{
                          backgroundColor: 'lightgray',
                          border: '0px solid darkgray',
                          width: '26px',
                          height: '26px',
                          borderRadius: '13px',
                          overflow: 'hidden'
                        }}
                        className="mr-2 d-flex justify-content-center align-items-center"
                      >
                        <FontAwesomeIcon
                          icon={faUser}
                          style={{ fontSize: 'x-large', color: 'white' }}
                          className="mt-2"
                        />
                      </div>
                      {this.state.userName}
                    </div>
                  </div>
                  <UserSettingsModal
                    isOpen={this.state.userSettingsModalOpen}
                    onClose={this.toggleUserSettingsModal}
                    twoFAEnabled={this.state.twoFAEnabled}
                    onLogout={() => this.onLogout(true)}
                    enable2FA={this.enable2FA}
                    userMail={this.state.userMail}
                  ></UserSettingsModal>
                </div>
                {projectAvailable ? null : (
                  <NoProjectPage
                    onCreateProject={e => {
                      e.preventDefault();
                      this.onProjectEditModal(true);
                    }}
                  ></NoProjectPage>
                )}
                <div
                  style={{ marginLeft: this.state.navbarWidth, width: '100%' }}
                >
                  <Route
                    {...this.props}
                    path="/:userName/:projectID"
                    render={props => (
                      <AppContent
                        {...props}
                        userName={this.state.userName}
                        userMail={this.state.userMail}
                        onDeleteProject={this.onDeleteProject}
                        modalOpen={modalOpen}
                        project={
                          this.state.projects.filter(
                            x => x._id === this.state.currentProjectId
                          )[0]
                        }
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
