import React from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { theme } from "./theme";
import { NotificationProvider } from "./components/NotificationHandler/NotificationProvider";
import NavbarLayout from "./NavbarLayout";
import AuthWall from "./routes/login";
import RegisterPage from "./routes/register";
import AppContent from "./AppContent";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

const App = () => {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications position="top-right" />
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="*"
          element={
            <AuthWall>
              <NotificationProvider>
                <NavbarLayout>
                  <AppContent />
                </NavbarLayout>
              </NotificationProvider>
            </AuthWall>
          }
        />
      </Routes>
    </MantineProvider>
  );
};

export default App;
