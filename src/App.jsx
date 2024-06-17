import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import { NotificationProvider } from './components/NotificationHandler/NotificationProvider';
import NavbarLayout from './NavbarLayout';
import AuthWall from './routes/login';
import RegisterPage from './routes/register';
import AppContent from './AppContent';
import useProjectStore from './stores/projectStore';

import '../scss/custom.scss'

const App = () => {

  const { currentProject, getProjects } = useProjectStore();

  useEffect(() => {
    getProjects();
  }, []);

  return (
    <div className="h-100vh">
      <Routes>
        <Route path="/register" element={<RegisterPage></RegisterPage>} />
        <Route
          path="*"
          element={
            <AuthWall>
              <NotificationProvider>
                <NavbarLayout>
                  <AppContent></AppContent>
                </NavbarLayout>
              </NotificationProvider>
            </AuthWall>
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
