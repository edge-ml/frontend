import apiConsts from './ApiConstants';
import ax from 'axios';
import { getProjects } from './ProjectService';

const axios = ax.create();

export const getDevices = () => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.DEVICE
      )
    )
      .then((data) => resolve(data.data))
      .catch((err) => reject(err.response));
  });
};

/*
export const getDeviceById = (deviceId) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.DEVICE + `/${deviceId}`
      )
    )
      .then((data) => {
        console.log(data.data);
        resolve(data.data);
      })
      .catch((err) => reject(err.response));
  });
};*/

export const getDeviceByNameAndGeneration = (name, generation) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.DEVICE + `/${name}` + `/${generation}`
      )
    )
      .then((data) => {
        resolve(data.data);
      })
      .catch((err) => reject(err.response));
  });
};
