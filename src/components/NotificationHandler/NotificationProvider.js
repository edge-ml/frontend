import React, { createContext, useState, useEffect } from 'react';
import {
  downloadDatasetsRegister,
  datasetDownloadStatus,
} from '../../services/DatasetService';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [activeNotifications, setActiveNotifications] = useState([]);

  // Load activeNotifications from localStorage on component mount
  useEffect(() => {
    const storedNotifications = localStorage.getItem('activeNotifications');
    if (storedNotifications) {
      setActiveNotifications(JSON.parse(storedNotifications));
    }
  }, []);

  // Save activeNotifications to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      'activeNotifications',
      JSON.stringify(activeNotifications)
    );
  }, [activeNotifications]);

  const registerDownload = async (datasets) => {
    const datasetIds = datasets.map((elm) => elm._id);
    const res = await downloadDatasetsRegister(datasetIds);
    const newNotification = { datasets, status: 0, downloadId: res.id };
    setActiveNotifications((prevState) => [...prevState, newNotification]);
  };

  const removeNotification = (id) => {
    const newNotifications = activeNotifications.filter(
      (elm) => elm.downloadId !== id
    );
    setActiveNotifications(newNotifications);
  };

  const updateNotifications = () => {
    setActiveNotifications((prevNotifications) => {
      const updatePromises = prevNotifications.map((elm) => {
        if (elm.status < 100) {
          return datasetDownloadStatus(elm.downloadId);
        } else {
          return Promise.resolve(elm.status);
        }
      });

      Promise.all(updatePromises)
        .then((newStats) => {
          const newNotifications = prevNotifications.map((elm, i) => {
            const newStatus = newStats[i];
            if (newStatus <= 100 && newStatus > elm.status) {
              return { ...elm, status: newStatus };
            } else {
              return elm;
            }
          });
          setActiveNotifications(newNotifications);
        })
        .catch((error) => {
          console.error('Error updating notifications:', error);
        });
      return prevNotifications; // Return the previous state to avoid unnecessary re-renders
    });
  };

  useEffect(() => {
    const updateHandle = setInterval(updateNotifications, 2000);
    return () => {
      clearInterval(updateHandle);
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{ registerDownload, activeNotifications, removeNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
