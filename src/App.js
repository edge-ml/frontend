import React, { Component, Fragment } from 'react';
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
  faLightbulb,
} from '@fortawesome/free-solid-svg-icons';
import Navbar from './components/Navbar/Navbar';
import MobileHeader from './components/MobileHeader/MobileHeader';

import { faGithub } from '@fortawesome/free-brands-svg-icons';

import AuthWall from './routes/login';
import RegisterPage from './routes/register';
import { getProjects } from './services/ApiServices/ProjectService';
import EditProjectModal from './components/EditProjectModal/EditProjectModal';
import {
  setProject,
  getProject,
  clearToken,
  setToken,
  clearProject,
} from './services/LocalStorageService';
import UserSettingsModal from './components/UserSettingsModal/UserSettingsModal';
import AppContent from './AppContent';
import NoProjectPage from './components/NoProjectPage/NoProjectPage';
import ErrorPage from './components/ErrorPage/ErrorPage';
import {
  deleteProject,
  leaveProject,
} from './services/ApiServices/ProjectService';
import Loader from './modules/loader';
import AppView from './AppView';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userMail: undefined,
      userName: undefined,
      isLoggedIn: false,
      twoFAEnabled: false,
      currentUserMail: undefined,
      projects: undefined,
      currentProjectId: undefined,
      projectLocation: undefined,
      projectEditModalOpen: false,
      projectEditModalNew: false,
      userSettingsModalOpen: false,
      navbarWidth: '160px',
      mobileNavbarShown: false,
    };
    this.baseState = JSON.parse(JSON.stringify(this.state));
    this.logoutHandler = this.logoutHandler.bind(this);
    this.onLogout = this.onLogout.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.setAccessToken = this.setAccessToken.bind(this);
    this.getCurrentUserMail = this.getCurrentUserMail.bind(this);
    this.setCurrentUserMail = this.setCurrentUserMail.bind(this);
    this.onProjectClick = this.onProjectClick.bind(this);
    this.onProjectEditModal = this.onProjectEditModal.bind(this);
    this.onProjectModalClose = this.onProjectModalClose.bind(this);
    this.onProjectsChanged = this.onProjectsChanged.bind(this);
    this.refreshProjects = this.refreshProjects.bind(this);
    this.onUserLoggedIn = this.onUserLoggedIn.bind(this);
    this.enable2FA = this.enable2FA.bind(this);
    this.changeURL = this.changeURL.bind(this);
    this.navigateTo = this.navigateTo.bind(this);
    this.onDeleteProject = this.onDeleteProject.bind(this);
    this.onLeaveProject = this.onLeaveProject.bind(this);
    this.onMobileNavbarClose = this.onMobileNavbarClose.bind(this);
    this.onMobileNavbarToggle = this.onMobileNavbarToggle.bind(this);

    this.props.history.listen(() => {
      const splitUrl = this.props.history.location.pathname
        .split('/')
        .filter((elm) => elm !== '');

      if (splitUrl[2] !== undefined) {
        this.setState({
          projectLocation: splitUrl[2], // handle changes of location from other places
        });
      }
    });
  }

  onMobileNavbarClose() {
    this.setState({
      mobileNavbarShown: false,
    });
  }

  onMobileNavbarToggle() {
    this.setState((prevState) => ({
      mobileNavbarShown: !prevState.mobileNavbarShown,
    }));
  }

  onDeleteProject(project) {
    deleteProject(project).then((data) => {
      this.onProjectsChanged(data);
    });
  }

  onLeaveProject(project) {
    leaveProject(project).then((data) => {
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
      .filter((elm) => elm !== '');
    splitUrl[0] = project.admin.userName;
    splitUrl[1] = project.name;
    this.props.history.push('/' + splitUrl.join('/'));
  }

  navigateTo(location) {
    const project = this.state.projects.filter(
      (x) => x._id === this.state.currentProjectId
    )[0];
    this.props.history.push(
      '/' + project.admin.userName + '/' + project.name + '/' + location
    );
    this.setState({
      projectLocation: location,
    });
  }

  enable2FA() {
    this.setState({
      twoFAEnabled: true,
    });
  }

  onProjectsChanged(projects, index) {
    if (projects.length === 0) {
      this.props.history.push('/');
      this.setState({
        projects: [],
        currentProjectId: -1,
        projectEditModalOpen: false,
      });
      clearProject();
      return;
    }

    var newProject = false;
    var projectIndex = projects.findIndex(
      (elm) => elm._id === this.state.currentProjectId
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
      projectLocation: 'datasets',
    });
    this.changeURL(this.state.projects[projectIndex]);
    if (newProject) {
      this.navigateTo('datasets');
    }
  }

  onProjectModalClose() {
    this.setState({
      projectEditModalOpen: false,
    });
  }

  onProjectEditModal(isNew) {
    this.setState({
      projectEditModalOpen: true,
      projectEditModalNew: isNew,
    });
  }

  onProjectClick(id) {
    console.log(id);
    if (this.state.currentProjectId === id) {
      this.setState({
        currentProjectId: undefined,
      });
      this.changeURL(undefined);
      return;
    }
    setProject(id);

    this.setState({
      currentProjectId: id,
    });

    this.changeURL(this.state.projects.filter((x) => x._id === id)[0]);
  }

  refreshProjects() {
    getProjects()
      .then((projects) => {
        // if no project is available
        if (projects.length === 0) {
          this.setState({
            projects: [],
          });
          this.props.history.push('/');
          return;
        }

        // if the user comes to a url parse the name of the project from it
        const params = this.props.history.location.pathname.split('/');
        const projectIndex = projects.findIndex(
          (elm) => elm.name === params[2]
        );
        const retrievedProjectLocation = params[3];
        this.setState({
          projectLocation: retrievedProjectLocation,
        });

        if (projectIndex !== -1) {
          this.setState({
            projects: projects,
            currentProjectId: projects[projectIndex]._id,
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
          (elm) => elm._id === getProject()
        );

        if (storedProjectIndex === -1) {
          storedProjectIndex = 0;
        }
        setProject(projects[storedProjectIndex]._id);
        this.setState({
          projects: projects,
          currentProjectId: projects[storedProjectIndex]._id,
          projectLocation: 'datasets',
        });

        this.props.history.push(
          '/' +
            projects[storedProjectIndex].admin.userName +
            '/' +
            projects[storedProjectIndex].name +
            '/datasets'
        );
      })
      .catch((errorStatus) => {
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
      isLoggedIn: true,
    });
    this.refreshProjects();
  }

  getCurrentUserMail() {
    return this.state.currentUserMail;
  }

  setCurrentUserMail(currentUserMail) {
    this.setState({
      currentUserMail: currentUserMail,
    });
  }

  async setAccessToken(token) {
    let tmpUser = { ...this.state.user };
    tmpUser.access_token = token;
    this.setState({
      user: tmpUser,
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
        isLoggedIn: didSucceed,
      });
    }
  }

  logoutHandler() {
    this.onLogout(true);
  }

  render() {
    var projectIndex = this.state.projects
      ? this.state.projects.findIndex(
          (x) => x._id === this.state.currentProjectId
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
      <Fragment>
        <EditProjectModal
          project={
            this.state.projects ? this.state.projects[projectIndex] : undefined
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
          render={(props) => <RegisterPage {...props} />}
        />
        <Route
          path={'/errorpage/:error/:errorText?/:statusText?'}
          render={(props) => <ErrorPage {...props} />}
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
            <Loader loading={!(this.state.isLoggedIn && this.state.projects)}>
              <AppView
                mobileNavbarShown={this.state.mobileNavbarShown}
                onMobileNavbarClose={this.onMobileNavbarClose}
                mobileHeader={
                  <MobileHeader
                    mobileNavbarShown={this.state.mobileNavbarShown}
                    onMenuButton={this.onMobileNavbarToggle}
                    projectAvailable={projectAvailable}
                  />
                }
                navbar={
                  <Navbar
                    userName={this.state.userName}
                    enable2FA={this.enable2FA}
                    userMail={this.state.userMail}
                    onLogout={this.onLogout}
                    currentProjectId={this.state.currentProjectId}
                    twoFAEnabled={this.state.twoFAEnabled}
                    location={this.props.location}
                    projectAvailable={projectAvailable}
                    projects={this.state.projects}
                    selectedProjectId={this.state.selectedProjectId}
                    onProjectClick={this.onProjectClick}
                    navigateTo={this.navigateTo}
                    onProjectEditModal={this.onProjectEditModal}
                  ></Navbar>
                }
                content={
                  <Fragment>
                    {projectAvailable ? null : (
                      <NoProjectPage
                        onCreateProject={(e) => {
                          e.preventDefault();
                          this.onProjectEditModal(true);
                        }}
                      ></NoProjectPage>
                    )}
                    <Route
                      {...this.props}
                      path="/:userName/:projectID"
                      render={(props) => (
                        <AppContent
                          {...props}
                          userName={this.state.userName}
                          userMail={this.state.userMail}
                          onDeleteProject={this.onDeleteProject}
                          onLeaveProject={this.onLeaveProject}
                          modalOpen={modalOpen}
                          project={
                            this.state.projects.filter(
                              (x) => x._id === this.state.currentProjectId
                            )[0]
                          }
                          onProjectsChanged={this.onProjectsChanged}
                          navigateTo={this.navigateTo}
                        />
                      )}
                    ></Route>
                  </Fragment>
                }
              />
            </Loader>
          </AuthWall>
        ) : null}
      </Fragment>
    );
  }
}

export default App;
