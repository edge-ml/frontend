import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { NotificationProvider } from './components/NotificationHandler/NotificationProvider';
import NavbarLayout from './NavbarLayout';
import AuthWall from './routes/login';
import RegisterPage from './routes/register';
import AppContent from './AppContent';
import ErrorPage from './components/ErrorPage/ErrorPage';
import { Switch } from 'react-router-dom';
import { AuthProvider } from './AuthProvider';
import { ProjectProvider } from './ProjectProvider';

const App = () => {
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

      <Routes>
        <Route path="/register" element={<RegisterPage></RegisterPage>} />
      </Routes>
      {/* <Route
          path={"/errorpage/:error/:errorText?/:statusText?"}
          render={(props) => <ErrorPage {...props} />}
        /> */}
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
    </div>
  );
};

export default App;
