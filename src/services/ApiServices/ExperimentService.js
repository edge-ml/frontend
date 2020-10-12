var apiConsts = require('./ApiConstants');
const ax = require('axios');
const { default: LocalStorageService } = require('../LocalStorageService');
const axios = ax.create();
const localStorageService = LocalStorageService.getService();

axios.interceptors.request.use(config => {
  const token = localStorageService.getAccessToken();
  if (token) {
    config.headers['Authorization'] = token;
  }
  return config;
});

module.exports.subscribeExperiments = callback => {
  axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.GET,
      apiConsts.API_URI,
      apiConsts.API_ENDPOINTS.EXPERIMENTS
    )
  )
    .then(experiments => callback(experiments.data))
    .catch(err => window.alert(err));
};

module.exports.addExperiment = (newExperiment, callback) => {
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
        .then(experiments => callback(experiments.data))
        .catch(err => window.alert(err))
    )
    .catch(err => window.alert(err));
};

module.exports.updateExperiment = (experiment, callback) => {
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
    .then(experiments => callback(experiments.data))
    .catch(err => window.alert(err));
};

module.exports.deleteExperiment = (experimentId, callback) => {
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
        .then(experiments => callback(experiments))
        .catch(err => window.alert(err))
    )
    .catch(err => window.alert(err));
};
