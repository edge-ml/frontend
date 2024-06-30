import apiConsts from './ApiConstants';
import ax from 'axios';
import useApiCalls from './useApiCalls';
import apiRequest from './request';

const axios = ax.create();

export const getStepOptions = async () => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.ML_URI,
    apiConsts.ML_ENDPOINTS.TRAIN + '/pipeline/options',
  )
  return res;
}

export const getModels = async () => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.ML_URI,
    apiConsts.ML_ENDPOINTS.MODELS,
  )
  return res;
}


export const deleteModel = async (modelId) => {
  const res = await axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.DELETE,
      apiConsts.ML_URI,
      apiConsts.ML_ENDPOINTS.MODELS + `/${modelId}`,
    ),
  );
  return res.data;
};


export const getTrainConfig = async () => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.ML_URI,
    apiConsts.ML_ENDPOINTS.TRAIN
  )
  return res;
}


// export const getTrainedModels = function () {
//   return new Promise((resolve, reject) => {
//     axios(
//       apiConsts.generateApiRequest(
//         apiConsts.HTTP_METHODS.GET,
//         apiConsts.ML_URI,
//         apiConsts.ML_ENDPOINTS.TRAINED_MODELS,
//       ),
//     )
//       .then((data) => resolve(data.data))
//       .catch((err) => reject(err.response));
//   });
// };

// export const getTrained = function (id) {
//   return new Promise((resolve, reject) => {
//     axios(
//       apiConsts.generateApiRequest(
//         apiConsts.HTTP_METHODS.GET,
//         apiConsts.ML_URI,
//         apiConsts.ML_ENDPOINTS.TRAINED_MODELS + '/' + id,
//       ),
//     )
//       .then((data) => resolve(data.data))
//       .catch((err) => reject(err.response));
//   });
// };

// export const deleteTrained = function (id) {
//   return new Promise((resolve, reject) => {
//     axios(
//       apiConsts.generateApiRequest(
//         apiConsts.HTTP_METHODS.DELETE,
//         apiConsts.ML_URI,
//         apiConsts.ML_ENDPOINTS.TRAINED_MODELS + '/' + id,
//       ),
//     )
//       .then((resp) => resolve(resp.data))
//       .catch((err) => reject(err.response));
//   });
// };

export const train = async (data) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.POST,
    apiConsts.ML_URI,
    apiConsts.ML_ENDPOINTS.TRAIN,
    data,
  );
  return res;
}

// export const train = function (data) {
//   return new Promise((resolve, reject) => {
//     axios(
//       apiConsts.generateApiRequest(
//         apiConsts.HTTP_METHODS.POST,
//         apiConsts.ML_URI,
//         apiConsts.ML_ENDPOINTS.TRAIN,
//         data,
//       ),
//     )
//       .then(() => resolve()) // TODO: ml should return training id
//       .catch((err) => reject(err.response));
//   });
// };

// export const getActiveTrainingById = function (trainId) {
//   return new Promise((resolve, reject) => {
//     axios(
//       apiConsts.generateApiRequest(
//         apiConsts.HTTP_METHODS.GET,
//         apiConsts.ML_URI,
//         apiConsts.ML_ENDPOINTS.TRAIN_ONGOING + '/' + trainId,
//       ),
//     )
//       .then((data) => resolve(data.data))
//       .catch((err) => reject(err.response));
//   });
// };

// export const getAllActiveTrainings = function () {
//   return new Promise((resolve, reject) => {
//     axios(
//       apiConsts.generateApiRequest(
//         apiConsts.HTTP_METHODS.GET,
//         apiConsts.ML_URI,
//         apiConsts.ML_ENDPOINTS.TRAIN_ONGOING,
//       ),
//     )
//       .then((data) => resolve(data.data))
//       .catch((err) => reject(err.response));
//   });
// };

// export const getTrainedDeployments = function (id) {
//   return new Promise((resolve, reject) => {
//     axios(
//       apiConsts.generateApiRequest(
//         apiConsts.HTTP_METHODS.GET,
//         apiConsts.ML_URI,
//         apiConsts.ML_ENDPOINTS.TRAINED_MODELS + '/' + id + '/deployments',
//       ),
//     )
//       .then((data) => resolve(data.data))
//       .catch((err) => reject(err.response));
//   });
// };

// export const deployTrained = function (id, data) {
//   return new Promise((resolve, reject) => {
//     axios(
//       apiConsts.generateApiRequest(
//         apiConsts.HTTP_METHODS.POST,
//         apiConsts.ML_URI,
//         apiConsts.ML_ENDPOINTS.TRAINED_MODELS + '/' + id + '/deploy',
//         data,
//       ),
//     )
//       .then((data) => resolve(data.data))
//       .catch((err) => reject(err.response));
//   });
// };

// export const getDeployDevices = function (id) {

//   return new Promise((resolve, reject) => {
//     axios(
//       apiConsts.generateApiRequest(
//         apiConsts.HTTP_METHODS.GET,
//         apiConsts.ML_URI,
//         apiConsts.ML_ENDPOINTS.DEPLOY + '/' + id,
//       ),
//     )
//       .then((data) => resolve(data.data))
//       .catch((err) => reject(err.response));
//   });
// };


export const getDeployDevices = async (id) => {
  const res = apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.ML_URI,
    apiConsts.ML_ENDPOINTS.DEPLOY + '/' + id,
  )
  return res;
}

export const deployModel = function (
  id,
  tsMap,
  parameters,
  selectedDevice,
  additionalSettings,
) {

  return new Promise((resolve, reject) => {
    const request = apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.POST,
      apiConsts.ML_URI,
      apiConsts.ML_ENDPOINTS.DEPLOY + '/' + id,
      {
        tsMap: tsMap,
        parameters: parameters,
        device: selectedDevice,
        additionalSettings: additionalSettings,
      },
    );
    request['responseType'] = 'arraybuffer';
    axios(request)
      .then((data) => resolve(data.data))
      .catch((err) => reject(err.response));
  });
};

export const downloadFirmware = function (
  id,
  tsMap,
  parameters,
  selectedDevice,
  additionalSettings,
) {

  return new Promise((resolve, reject) => {
    const request = apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.POST,
      apiConsts.ML_URI,
      apiConsts.ML_ENDPOINTS.DEPLOY + '/' + id + '/download',
      {
        tsMap: tsMap,
        parameters: parameters,
        device: selectedDevice,
        additionalSettings: additionalSettings,
      },
    );
    request['responseType'] = 'arraybuffer';
    axios(request)
      .then((data) => resolve(data.data))
      .catch((err) => reject(err.response));
  });
};

// export default useMLAPI;
