var apiConsts = require('./ApiConstants');
const ax = require('axios');
const axios = ax.create();

module.exports.deleteDeployment = function(key) {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.DELETE,
        apiConsts.ML_URI,
        apiConsts.ML_ENDPOINTS.DEPLOY + '/' + key
      )
    )
      .then(() => resolve())
      .catch(err => reject(err.response));
  });
};

module.exports.getDeployment = function(key) {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.ML_URI,
        apiConsts.ML_ENDPOINTS.DEPLOY + '/' + key
      )
    )
      .then(data => resolve(data.data))
      .catch(err => reject(err.response));
  });
};

module.exports.changeDeploymentName = function(key, name) {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.PUT,
        apiConsts.ML_URI,
        apiConsts.ML_ENDPOINTS.DEPLOY + '/' + key + '/name',
        name
      )
    )
      .then(() => resolve())
      .catch(err => reject(err.response));
  });
};

module.exports.downloadDeploymentModel = function(key, platform) {
  return new Promise((resolve, reject) => {
    axios({
      ...apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.ML_URI,
        apiConsts.ML_ENDPOINTS.DEPLOY + '/' + key + '/export/' + platform
      ),
      responseType: 'blob'
    })
      .then(resp => resolve(resp.data))
      .catch(err => reject(err.response));
  });
};
