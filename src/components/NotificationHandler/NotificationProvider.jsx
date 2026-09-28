import React, { createContext, useState, useEffect, useRef } from "react";
import {
  datasetDownloadStatus,
  cancelDownload,
  registerDatasetDownload as reg_dataset_download,
  registerProjectDownload as reg_project_download,
} from "../../services/DatasetService";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [activeNotifications, setActiveNotifications] = useState([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(true); // Flag variable
  const updateHandle = useRef(null);

  const registerProjectDownload = async () => {
    const res = await reg_project_download();
    setActiveNotifications((prevState) => [...prevState, res]);
    setHasNewNotifications(true);
    startUpdates();
  };

  const registerDatasetDownload = async (datasetId) => {
    const res = await reg_dataset_download(datasetId);
    setActiveNotifications((prevState) => [...prevState, res]);
    setHasNewNotifications(true);
    startUpdates();
  };

  const removeNotification = (id) => {
    const newNotifications = activeNotifications.filter(
      (elm) => elm.downloadId !== id
    );
    cancelDownload(id);
    setActiveNotifications(newNotifications);
  };

  const updateNotifications = async () => {
    if (activeNotifications.length === 0) {
      stopUpdates();
      return;
    }
    try {
      const notifications = await datasetDownloadStatus();
      if (notifications >= 400) {
        setHasNewNotifications(false);
        return;
      }
      setActiveNotifications(notifications);
      const uncompletedNotifications =
        notifications.map((elm) => elm.status).filter((elm) => elm != 100) > 0;
      if (!uncompletedNotifications || notifications.length === 0) {
        stopUpdates();
      }
      setHasNewNotifications(uncompletedNotifications); // Update the flag
    } catch {
      // Ignore polling errors (e.g. while logged out) so the interval
      // doesn't spam the backend with failing requests.
    }
  };

  const startUpdates = () => {
    if (updateHandle.current === null) {
      const handle = setInterval(updateNotifications, 2000);
      updateHandle.current = handle;
    }
  };

  const stopUpdates = () => {
    clearInterval(updateHandle.current);
    updateHandle.current = null;
  };

  useEffect(() => {
    // Don't poll on mount: only fetch status once a download was registered
    // (startUpdates is called by registerDatasetDownload/registerProjectDownload).
    return () => stopUpdates();
  }, []);

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
