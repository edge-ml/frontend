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

  // const registerDownload = async (datasets) => {
  //   const datasetIds = datasets.map((elm) => elm._id);
  //   const res = await downloadDatasetsRegister(datasetIds);
  //   const newNotification = { datasets, status: 0, downloadId: res.id };
  //   setActiveNotifications((prevState) => [...prevState, newNotification]);
  // };

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

  // const updateNotifications = () => {
  //   setActiveNotifications((prevNotifications) => {
  //     const updatePromises = prevNotifications.map((elm) => {
  //       if (elm.status < 100) {
  //         return datasetDownloadStatus(elm.downloadId);
  //       } else {
  //         return Promise.resolve(elm.status);
  //       }
  //     });

  //     Promise.all(updatePromises)
  //       .then((newStats) => {
  //         const newNotifications = prevNotifications.map((elm, i) => {
  //           const newStatus = newStats[i];
  //           console.log(newStatus, elm.status);
  //           if (newStatus > 100) {
  //             return { ...elm, error: true, status: newStatus };
  //           }
  //           return {...elm, status: newStatus};
  //         });
  //         setActiveNotifications(newNotifications);
  //       })
  //       .catch((error) => {
  //         console.error('Error updating notifications:', error);
  //       });
  //     return prevNotifications; // Return the previous state to avoid unnecessary re-renders
  //   });
  // };

  const updateNotifications = async () => {
    const status = await datasetDownloadStatus();
    console.log(status);
    setActiveNotifications(status);
  };

  useEffect(() => {
    const updateHandle = setInterval(updateNotifications, 2000);
    return () => {
      clearInterval(updateHandle);
    };
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
