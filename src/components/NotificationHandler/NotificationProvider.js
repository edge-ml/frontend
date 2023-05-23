import React, { createContext, useState, useEffect } from 'react';
import {
  downloadDatasetsRegister,
  datasetDownloadStatus,
  cancelDownload,
  registerDatasetDownload as regb_dataset_download,
  registerProjectDownload as reg_project_download,
} from '../../services/DatasetService';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [activeNotifications, setActiveNotifications] = useState([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(true);
  var updateHandle = undefined;

  const registerProjectDownload = async () => {
    const res = await reg_project_download();
    console.log(res);
    setActiveNotifications((prevState) => [...prevState, res]);
  };

  const registerDatasetDownload = async (datasetId) => {
    const res = await regb_dataset_download(datasetId);
    console.log(res);
    setActiveNotifications((prevState) => [...prevState, res]);
  };

  const removeNotification = (id) => {
    const newNotifications = activeNotifications.filter(
      (elm) => elm.downloadId !== id
    );
    cancelDownload(id);
    setActiveNotifications(newNotifications);
  };

  const updateNotifications = async () => {
    const status = await datasetDownloadStatus();
    console.log(status);
    setActiveNotifications(status);
    setHasNewNotifications(status.length > 0); // Update the flag
  };

  useEffect(() => {
    updateHandle = setInterval(updateNotifications, 2000);
    return () => {
      clearInterval(updateHandle);
    };
  }, []);

  useEffect(() => {
    if (!hasNewNotifications) {
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
