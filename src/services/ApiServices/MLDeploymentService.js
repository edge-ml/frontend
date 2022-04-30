var apiConsts = require('./ApiConstants');
const ax = require('axios');
const axios = ax.create();

module.exports.getPlatformCode = function(modelId, format) {
  return new Promise((resolve, reject) => {
    axios({
      ...apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.ML_URI,
        apiConsts.ML_ENDPOINTS.DEPLOY + '/' + modelId + '/export/' + format
      )
    })
      .then(resp => resolve(resp.data))
      .catch(err => reject(err.response));
  });
};

module.exports.downloadDeploymentModel = function(modelId, format) {
  return new Promise((resolve, reject) => {
    axios({
      ...apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.ML_URI,
        apiConsts.ML_ENDPOINTS.DEPLOY + '/' + modelId + '/download/' + format
      ),
      responseType: 'blob'
    })
      .then(resp => resolve(resp.data))
      .catch(err => reject(err.response));
  });
};
