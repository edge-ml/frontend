import React from 'react';
import { Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { NotificationProvider } from './components/NotificationHandler/NotificationProvider';
import NavbarLayout from './NavbarLayout';
import AuthWall from './routes/login';
import RegisterPage from './routes/register';
import AppContent from './AppContent';
import { AuthProvider } from './AuthProvider';
import { ProjectProvider } from './ProjectProvider';

const App = () => {
  return (
    <div className="h-100vh">
      <Routes>
        <Route path="/register" element={<RegisterPage></RegisterPage>} />
        <Route
          path="*"
          element={
            // <AuthProvider>
            <AuthWall>
              <NotificationProvider>
                <ProjectProvider>
                  <NavbarLayout>
                    <AppContent></AppContent>
                  </NavbarLayout>
                </ProjectProvider>
              </NotificationProvider>
            </AuthWall>
            // </AuthProvider>
          }
        ></Route>
      </Routes>
      {/* <Route
          path={"/errorpage/:error/:errorText?/:statusText?"}
          render={(props) => <ErrorPage {...props} />}
        /> */}
    </div>
  );
};

export default App;
