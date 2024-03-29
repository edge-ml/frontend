import apiConsts from './ApiConstants';
import ax from 'axios';

const axios = ax.create();

export const getArduinoFirmware = function (deviceName) {
  const request = apiConsts.generateApiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.API_URI,
    apiConsts.API_ENDPOINTS.ARDUINOFIRMWARE + `/${deviceName}`
  );
  request['responseType'] = 'arraybuffer';
  return new Promise((resolve, reject) => {
    axios(request)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => reject(err.response));
  });
};

export const getLatestEdgeMLVersionNumber = function () {
  return new Promise((resolve, reject) => {
    axios('https://api.github.com/repos/edge-ml/EdgeML-Arduino/tags')
      .then((res) => {
        var format = /^[0-9][0-9.]*$/;
        if (format.test(res.data[0].name)) {
          resolve(res.data[0].name);
        } else {
          reject(new Error('Illegal version format'));
        }
      })
      .catch((err) => reject(err.response));
  });
};
