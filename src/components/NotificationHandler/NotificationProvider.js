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
  const [updateHandle, setUpdateHandle] = useState(null); // Initialize updateHandle as a state variable

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
    console.log(updateHandle);
    const status = await datasetDownloadStatus();
    if (status >= 400) {
      setHasNewNotifications(false);
      return;
    }
    setActiveNotifications(status);
    setHasNewNotifications(status.length > 0); // Update the flag
  };

  useEffect(() => {
    const handle = setInterval(updateNotifications, 2000); // Assign to updateHandle
    setUpdateHandle(handle);
    return () => {
      clearInterval(updateHandle);
    };
  }, []);

  // Stop polling if no new notifications were found during the last pull
  useEffect(() => {
    if (!hasNewNotifications) {
      console.log('Clear interval');
      clearInterval(updateHandle);
    }
  }, [hasNewNotifications]);

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
