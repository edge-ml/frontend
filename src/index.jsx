import React from "react";
import { createRoot } from "react-dom/client";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <MantineProvider
    theme={{
      primaryColor: "brand",
      colors: {
        brand: [
          "#48bb78",
          "#dff5e6",
          "#b8e9c9",
          "#8edcab",
          "#67cf8f",
          "#48bb78",
          "#34a665",
          "#238f54",
          "#167746",
          "#0c5f39",
        ],
      },
    }}
  >
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
