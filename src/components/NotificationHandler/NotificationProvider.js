import React, { createContext, useState, useEffect, useRef } from 'react';
import {
  downloadDatasetsRegister,
  datasetDownloadStatus,
  cancelDownload,
  registerDatasetDownload as reg_dataset_download,
  registerProjectDownload as reg_project_download,
} from '../../services/DatasetService';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [activeNotifications, setActiveNotifications] = useState([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(true); // Flag variable
  const updateHandle = useRef(null);

  const registerProjectDownload = async () => {
    const res = await reg_project_download();
    console.log(res);
    setActiveNotifications((prevState) => [...prevState, res]);
    setHasNewNotifications(true);
    startUpdates();
  };

  const registerDatasetDownload = async (datasetId) => {
    const res = await reg_dataset_download(datasetId);
    console.log(res);
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
    const notifications = await datasetDownloadStatus();
    console.log(notifications);
    if (notifications >= 400) {
      setHasNewNotifications(false);
      return;
    }
    setActiveNotifications(notifications);
    const uncompletedNotifications =
      notifications.map((elm) => elm.status).filter((elm) => elm != 100) > 0;
    console.log(!uncompletedNotifications || notifications.length === 0);
    console.log(uncompletedNotifications, notifications);
    if (!uncompletedNotifications || notifications.length === 0) {
      stopUpdates();
    }
    setHasNewNotifications(uncompletedNotifications); // Update the flag
  };

  const startUpdates = () => {
    console.log('Starting updates');
    if (updateHandle.current === null) {
      const handle = setInterval(updateNotifications, 2000);
      updateHandle.current = handle;
    }
  };

  const stopUpdates = () => {
    console.log('Stopping updates');
    clearInterval(updateHandle.current);
    updateHandle.current = null;
  };

  useEffect(() => {
    startUpdates();
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
