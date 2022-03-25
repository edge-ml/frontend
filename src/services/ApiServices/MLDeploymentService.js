var apiConsts = require('./ApiConstants');
const ax = require('axios');
const axios = ax.create();

module.exports.getDeployment = function(modelId) {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.ML_URI,
        apiConsts.ML_ENDPOINTS.DEPLOY + '/' + modelId
      )
    )
      .then(data => resolve(data.data))
      .catch(err => reject(err.response));
  });
};

module.exports.getPlatform = function(modelId, platform) {
  return new Promise((resolve, reject) => {
    axios({
      ...apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.ML_URI,
        apiConsts.ML_ENDPOINTS.DEPLOY + '/' + modelId + '/export/' + platform
      )
    })
      .then(resp => resolve(resp.data))
      .catch(err => reject(err.response));
  });
};

module.exports.getPlatform = function(modelId, platform) {
  return new Promise((resolve, reject) => {
    axios({
      ...apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.ML_URI,
        apiConsts.ML_ENDPOINTS.DEPLOY + '/' + modelId + '/export/' + platform
      )
    })
      .then(resp => resolve(resp.data))
      .catch(err => reject(err.response));
  });
};

module.exports.downloadDeploymentModel = function(modelId) {
  return new Promise((resolve, reject) => {
    axios({
      ...apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.ML_URI,
        apiConsts.ML_ENDPOINTS.DEPLOY + '/' + modelId + '/download'
      ),
      responseType: 'blob'
    })
      .then(resp => resolve(resp.data))
      .catch(err => reject(err.response));
  });
};
