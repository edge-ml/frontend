const apiConsts = require('./ApiConstants');
const ax = require('axios');
const axios = ax.create();
const getProjects = require('./ProjectService').getProjects;

module.exports.getDevices = () => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.DEVICE
      )
    )
      .then(data => resolve(data.data))
      .catch(err => reject(err.response));
  });
};

/*
module.exports.getDeviceById = (deviceId) => {
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

module.exports.getDeviceByNameAndGeneration = (name, generation) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.DEVICE + `/${name}` + `/${generation}`
      )
    )
      .then(data => {
        resolve(data.data);
      })
      .catch(err => reject(err.response));
  });
};
