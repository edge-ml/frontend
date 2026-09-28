import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import {
  isTauriBluetoothAvailable,
  getTauriBluetooth,
} from "./services/tauriBle";

if (isTauriBluetoothAvailable()) {
  try {
    navigator.bluetooth = getTauriBluetooth();
  } catch {
    Object.defineProperty(navigator, "bluetooth", {
      value: getTauriBluetooth(),
      writable: false,
      configurable: true,
    });
  }
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

if (window.navigator && navigator.serviceWorker) {
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}
