import apiConsts from './ApiConstants';
import ax from 'axios';

const axios = ax.create();

export const getModels = function () {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.ML_URI,
        apiConsts.ML_ENDPOINTS.TRAIN
      )
    )
      .then((data) => resolve(data.data))
      .catch((err) => reject(err.response));
  });
};

export const getTrainedModels = function () {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.ML_URI,
        apiConsts.ML_ENDPOINTS.TRAINED_MODELS
      )
    )
      .then((data) => resolve(data.data))
      .catch((err) => reject(err.response));
  });
};

export const getTrained = function (id) {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.ML_URI,
        apiConsts.ML_ENDPOINTS.TRAINED_MODELS + '/' + id
      )
    )
      .then((data) => resolve(data.data))
      .catch((err) => reject(err.response));
  });
};

export const deleteTrained = function (id) {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.DELETE,
        apiConsts.ML_URI,
        apiConsts.ML_ENDPOINTS.TRAINED_MODELS + '/' + id
      )
    )
      .then((resp) => resolve(resp.data))
      .catch((err) => reject(err.response));
  });
};

export const train = function (data) {
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
      .catch((err) => reject(err.response));
  });
};

export const getActiveTrainingById = function (trainId) {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.ML_URI,
        apiConsts.ML_ENDPOINTS.TRAIN_ONGOING + '/' + trainId
      )
    )
      .then((data) => resolve(data.data))
      .catch((err) => reject(err.response));
  });
};

export const getAllActiveTrainings = function () {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.ML_URI,
        apiConsts.ML_ENDPOINTS.TRAIN_ONGOING
      )
    )
      .then((data) => resolve(data.data))
      .catch((err) => reject(err.response));
  });
};

export const getTrainedDeployments = function (id) {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.ML_URI,
        apiConsts.ML_ENDPOINTS.TRAINED_MODELS + '/' + id + '/deployments'
      )
    )
      .then((data) => resolve(data.data))
      .catch((err) => reject(err.response));
  });
};

export const deployTrained = function (id, data) {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.ML_URI,
        apiConsts.ML_ENDPOINTS.TRAINED_MODELS + '/' + id + '/deploy',
        data
      )
    )
      .then((data) => resolve(data.data))
      .catch((err) => reject(err.response));
  });
};
