const getAccessToken = require('../LocalStorageService').getAccessToken;
var apiConsts = require('./ApiConstants');
const ax = require('axios');
const axios = ax.create();

module.exports.subscribeExperiments = () => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.EXPERIMENTS
      )
    )
      .then(experiments => resolve(experiments.data))
      .catch(err => reject(err));
  });
};

module.exports.addExperiment = newExperiment => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.EXPERIMENTS,
        newExperiment
      )
    )
      .then(() =>
        axios(
          apiConsts.generateApiRequest(
            apiConsts.HTTP_METHODS.GET,
            apiConsts.API_URI,
            apiConsts.API_ENDPOINTS.EXPERIMENTS
          )
        )
          .then(experiments => resolve(experiments.data))
          .catch(err => reject(err))
      )
      .catch(err => reject(err));
  });
};

module.exports.updateExperiment = experiment => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.PUT,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.EXPERIMENTS + `/${experiment['_id']}`,
        experiment
      )
    )
      .then(() =>
        axios(
          apiConsts.generateApiRequest(
            apiConsts.HTTP_METHODS.GET,
            apiConsts.API_URI,
            apiConsts.API_ENDPOINTS.EXPERIMENTS
          )
        )
      )
      .then(experiments => resolve(experiments.data))
      .catch(err => reject(err));
  });
};

module.exports.deleteExperiment = experimentId => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.DELETE,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.EXPERIMENTS + `/${experimentId}`
      )
    )
      .then(() =>
        axios(
          apiConsts.generateApiRequest(
            apiConsts.HTTP_METHODS.GET,
            apiConsts.API_URI,
            apiConsts.API_ENDPOINTS.EXPERIMENTS
          )
        )
          .then(experiments => resolve(experiments.data))
          .catch(err => reject(err))
      )
      .catch(err => reject(err));
  });
};
