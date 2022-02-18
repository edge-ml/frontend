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

module.exports.getTrainedModels = function() {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.ML_URI,
        apiConsts.ML_ENDPOINTS.TRAINED_MODELS
      )
    )
      .then(data => resolve(data.data))
      .catch(err => reject(err.response));
  });
};

module.exports.getTrained = function(id) {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.ML_URI,
        apiConsts.ML_ENDPOINTS.TRAINED_MODELS + '/' + id
      )
    )
      .then(data => resolve(data.data))
      .catch(err => reject(err.response));
  });
};

module.exports.train = function(data) {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.ML_URI,
        apiConsts.ML_ENDPOINTS.TRAIN,
        data
      )
    )
      .then(() => resolve()) // TODO: ml should return training id
      .catch(err => reject(err.response));
  });
};

module.exports.deleteModel = function(id) {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.DELETE,
        apiConsts.ML_URI,
        apiConsts.ML_ENDPOINTS.TRAINED_MODELS + '/' + id
      )
    )
      .then(data => resolve(data.data))
      .catch(err => reject(err.response));
  });
};
