import React, { createContext, useState, useEffect, useRef } from "react";
import { notifications } from "@mantine/notifications";
import {
  datasetDownloadStatus,
  datasetDownloadfromId,
  downloadFileName,
  cancelDownload,
  registerDatasetDownload as reg_dataset_download,
  registerProjectDownload as reg_project_download,
} from "../../services/DatasetService";

const NotificationContext = createContext();

// How often to ask the server whether a download is ready.
const POLL_MS = 1000;

export const NotificationProvider = ({ children }) => {
  const [activeNotifications, setActiveNotifications] = useState([]);
  const timer = useRef(null);
  // downloads someone is waiting for:
  // downloadId -> { resolve, reject, progress(percent) }
  const waiting = useRef(new Map());

  const stopUpdates = () => {
    clearInterval(timer.current);
    timer.current = null;
  };

  const updateNotifications = async () => {
    let entries;
    try {
      entries = await datasetDownloadStatus();
    } catch {
      // e.g. logged out, or the server is restarting: try again next time
      return;
    }
    if (!Array.isArray(entries)) return;
    setActiveNotifications(entries);
    waiting.current.forEach((waiter, downloadId) => {
      const entry = entries.find((elm) => elm.downloadId === downloadId);
      if (entry && !entry.error && entry.status < 100) {
        waiter.progress(entry.status);
        return;
      }
      waiting.current.delete(downloadId);
      if (!entry) waiter.reject(new Error("The download was cancelled"));
      else if (entry.error) waiter.reject(new Error(entry.error));
      else waiter.resolve(entry);
    });
    const preparing = entries.some((elm) => !elm.error && elm.status < 100);
    if (!preparing && waiting.current.size === 0) stopUpdates();
  };

  const startUpdates = () => {
    if (timer.current === null) {
      timer.current = setInterval(updateNotifications, POLL_MS);
    }
  };

  const forget = (downloadId) => {
    setActiveNotifications((current) =>
      current.filter((elm) => elm.downloadId !== downloadId)
    );
    return cancelDownload(downloadId);
  };

  // Asks the server to prepare a download, waits for it and saves the file,
  // telling the user what is going on meanwhile. Resolves to true when the
  // file was saved.
  const download = async (name, register) => {
    const id = `download-${Date.now()}-${Math.random()}`;
    const failed = (error) =>
      notifications.update({
        id,
        loading: false,
        autoClose: false,
        withCloseButton: true,
        color: "red",
        title: `Could not download ${name}`,
        message: error.message || "The download failed",
      });
    const progress = (message) => ({
      id,
      loading: true,
      autoClose: false,
      withCloseButton: false,
      title: `Downloading ${name}`,
      message,
    });
    notifications.show(progress("Preparing the files…"));
    let entry;
    try {
      entry = await register();
    } catch (error) {
      failed(error);
      return false;
    }
    setActiveNotifications((current) => [...current, entry]);
    try {
      const percent = (text, value) => (value > 0 ? `${text} ${value} %` : text);
      const ready = await new Promise((resolve, reject) => {
        waiting.current.set(entry.downloadId, {
          resolve,
          reject,
          progress: (status) =>
            notifications.update(
              progress(percent("Preparing the files…", status))
            ),
        });
        startUpdates();
      });
      notifications.update(progress("Fetching the file…"));
      let shown = 0;
      await datasetDownloadfromId(ready, (fraction) => {
        const value = Math.floor(fraction * 100);
        if (value === shown) return;
        shown = value;
        notifications.update(progress(percent("Fetching the file…", value)));
      });
      notifications.update({
        id,
        loading: false,
        autoClose: 5000,
        withCloseButton: true,
        color: "teal",
        title: `Downloaded ${name}`,
        message: `Saved as ${downloadFileName(ready)}`,
      });
      // it is on the user's disk now: nothing to keep on the server
      await forget(entry.downloadId);
      return true;
    } catch (error) {
      failed(error);
      // a failed download stays listed, with its error, until it is removed
      return false;
    }
  };

  const registerProjectDownload = () =>
    download("the project", () => reg_project_download());

  const registerDatasetDownload = (dataset) =>
    download(dataset.name || "the dataset", () => reg_dataset_download(dataset));

  const removeNotification = (downloadId) => {
    forget(downloadId);
  };

  useEffect(() => stopUpdates, []);

  return (
    <NotificationContext.Provider
      value={{
        registerProjectDownload,
        registerDatasetDownload,
        activeNotifications,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
