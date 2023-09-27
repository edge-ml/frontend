import React, { createContext, useState, useEffect } from 'react';
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
  const [updateHandle, setUpdateHandle] = useState(undefined); // Initialize updateHandle as a state variable

  const registerProjectDownload = async () => {
    const res = await reg_project_download();
    console.log(res);
    setActiveNotifications((prevState) => [...prevState, res]);
    setHasNewNotifications(true);
  };

  const registerDatasetDownload = async (datasetId) => {
    const res = await reg_dataset_download(datasetId);
    console.log(res);
    setActiveNotifications((prevState) => [...prevState, res]);
    setHasNewNotifications(true);
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
    if (!uncompletedNotifications) {
      stopUpdates();
    }
    setHasNewNotifications(uncompletedNotifications); // Update the flag
  };

  const startUpdates = () => {
    console.log('Starting updates');
    if (!updateHandle) {
      const handle = setInterval(updateNotifications, 2000); // Assign to updateHandle
      setUpdateHandle(handle);
    }
  };

  const stopUpdates = () => {
    console.log('Stopping updates');
    clearInterval(updateHandle);
  };

  useEffect(() => {
    startUpdates();
  }, []);

  // useEffect(() => {
  //   const handle = setInterval(updateNotifications, 2000); // Assign to updateHandle
  //   console.log(handle)
  //   setUpdateHandle(handle);
  //   return () => {
  //     clearInterval(updateHandle);
  //   };
  // }, []);

  // useEffect(() => {

  //   var handle = undefined;

  //   const updateNotifications = async () => {
  //     const notifications = await datasetDownloadStatus();
  //     if (notifications >= 400) {
  //       setHasNewNotifications(false);
  //       return;
  //     }
  //     setActiveNotifications(notifications)
  //     const uncompletedNotifications = notifications.map(elm => elm.status).filter(elm => elm != 100) > 0;
  //     if (!uncompletedNotifications) {
  //       clearInterval(handle)
  //     }
  //     setHasNewNotifications(uncompletedNotifications); // Update the flag
  //   }

  //   handle = setInterval(updateNotifications, 2000);
  // }, [])

  // Stop polling if no new notifications were found during the last pull
  // useEffect(() => {
  //   if (!hasNewNotifications) {
  //     console.log('Clear interval');
  //     clearInterval(updateHandle);
  //   }
  // }, [hasNewNotifications]);

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
