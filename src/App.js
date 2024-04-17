import React, { Fragment, useState } from 'react';
import { Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import MobileHeader from './components/MobileHeader/MobileHeader';
import { NotificationProvider } from './components/NotificationHandler/NotificationProvider';
import NavbarLayout from './NavbarLayout';
import AuthWall from './routes/login';
import RegisterPage from './routes/register';
import AppContent from './AppContent';
import NoProjectPage from './components/NoProjectPage/NoProjectPage';
import ErrorPage from './components/ErrorPage/ErrorPage';
import AppView from './AppView';
import { Switch } from 'react-router-dom/cjs/react-router-dom.min';
import { AuthProvider } from './AuthProvider';
import { ProjectProvider } from './ProjectProvider';
import { faL } from '@fortawesome/free-solid-svg-icons';

const App = () => {
  const [projectIndex, setProjectIndex] = useState(undefined);
  const [projects, setProjects] = useState(undefined);

  const projectAvailable = projects ? projects[0] : undefined;

  return (
    <div className="h-100vh">
      {/* <EditProjectModal
        project={
          this.state.projects ? this.state.projects[projectIndex] : undefined
        }
        isOpen={this.state.projectEditModalOpen}
        isNewProject={this.state.projectEditModalNew}
        userName={this.state.userName}
        onClose={this.onProjectModalClose}
        projectChanged={this.onProjectsChanged}
      ></EditProjectModal> */}

      <Switch>
        <Route
          exact
          path="/register"
          render={(props) => <RegisterPage {...props} />}
        />
        <Route
          path={'/errorpage/:error/:errorText?/:statusText?'}
          render={(props) => <ErrorPage {...props} />}
        />
        <Route>
          <AuthProvider>
            <AuthWall>
              <NotificationProvider>
                <ProjectProvider>
                  <NavbarLayout>
                    <AppContent></AppContent>
                  </NavbarLayout>
                </ProjectProvider>
              </NotificationProvider>
            </AuthWall>
          </AuthProvider>
        </Route>
      </Switch>
    </div>
  );
};

export default App;
