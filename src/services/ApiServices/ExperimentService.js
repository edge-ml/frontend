import apiConsts from './ApiConstants';
import ax from 'axios';

const axios = ax.create();

export const subscribeExperiments = () => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.EXPERIMENTS
      )
    )
      .then((experiments) => resolve(experiments.data))
      .catch((err) => reject(err));
  });
};

export const addExperiment = (newExperiment) => {
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
          .then((experiments) => resolve(experiments.data))
          .catch((err) => reject(err))
      )
      .catch((err) => reject(err));
  });
};

export const updateExperiment = (experiment) => {
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
      .then((experiments) => resolve(experiments.data))
      .catch((err) => reject(err));
  });
};

export const deleteExperiment = (experimentId) => {
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
          .then((experiments) => resolve(experiments.data))
          .catch((err) => reject(err))
      )
      .catch((err) => reject(err));
  });
};
