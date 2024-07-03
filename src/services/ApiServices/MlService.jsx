import apiConsts from './ApiConstants';
import ax from 'axios';
import apiRequest from './request';

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

export const getModel = async (modelId) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.ML_URI,
    apiConsts.ML_ENDPOINTS.MODELS + `/${modelId}`,
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


export const train = async (data) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.POST,
    apiConsts.ML_URI,
    apiConsts.ML_ENDPOINTS.TRAIN,
    data,
  );
  return res;
}

export const getDeployDevices = async (id) => {
  const res = await apiRequest(
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
