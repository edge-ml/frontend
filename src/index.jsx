import React from "react";
import { createRoot } from "react-dom/client";
import "@mantine/core/styles.css";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <MantineProvider>
    <BrowserRouter>
      <App></App>
    </BrowserRouter>
  </MantineProvider>
);

//registerServiceWorker();
if (window.navigator && navigator.serviceWorker) {
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}
