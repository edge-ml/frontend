var apiConsts = require('./ApiConstants');

const axios = require('axios');

module.exports.createDataset = function(dataset) {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.DATASETS,
        dataset
      )
    )
      .then(data => resolve(data.data))
      .catch(data => reject(data));
  });
};

module.exports.deleteDatasets = function() {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.DATASETS
      )
    )
      .then(data => resolve(data))
      .catch(reject(data));
  });
};
