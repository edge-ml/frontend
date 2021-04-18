const apiConsts = require('./ApiConstants');
const ax = require('axios');
const axios = ax.create();
const getProjects = require('./ProjectService').getProjects;

module.exports.setDeviceApiKey = () => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.SETDEVICEAPIKEY
      )
    )
      .then(data => resolve(data.data))
      .catch(err => reject(err.response));
  });
};

module.exports.getDeviceApiKey = () => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.GETDEVICEAPIKEY
      )
    )
      .then(data => resolve(data.data))
      .catch(err => reject(err.response));
  });
};

module.exports.deleteDeviceApiKey = () => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.REMOVEDEVICEAPIKEY
      )
    )
      .then(data => resolve(data.data))
      .catch(err => reject(err.response));
  });
};

module.exports.switchDeviceApiActive = activeState => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.SWTICHDEVICEAPIACTIVE,
        { state: activeState }
      )
    )
      .then(msg => {
        getProjects().then(data => resolve(data));
      })
      .catch(err => {
        reject(err.response);
      });
  });
};
