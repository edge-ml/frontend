var apiConsts = require('./ApiConstants');
const ax = require('axios');
const axios = ax.create();
const axiosNoToken = ax.create();

module.exports.getModels = function() {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.ML_URI,
        apiConsts.ML_ENDPOINTS.MODELS
      )
    )
      .then(data => resolve(data.data))
      .catch(err => reject(err.response));
  });
};
