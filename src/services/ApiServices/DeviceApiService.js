import apiConsts from './ApiConstants';
import ax from 'axios';
import { getProjects } from './ProjectService';

const axios = ax.create();

export const setDeviceApiKey = () => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.SETDEVICEAPIKEY
      )
    )
      .then((data) => resolve(data.data))
      .catch((err) => reject(err.response));
  });
};

export const getDeviceApiKey = () => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.GETDEVICEAPIKEY
      )
    )
      .then((data) => resolve(data.data))
      .catch((err) => reject(err.response));
  });
};

export const deleteDeviceApiKey = () => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.REMOVEDEVICEAPIKEY
      )
    )
      .then((data) => resolve(data.data))
      .catch((err) => reject(err.response));
  });
};

export const switchDeviceApiActive = (activeState) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.SWTICHDEVICEAPIACTIVE,
        { state: activeState }
      )
    )
      .then((msg) => {
        getProjects().then((data) => resolve(data));
      })
      .catch((err) => {
        reject(err.response);
      });
  });
};
