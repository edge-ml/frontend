import apiConsts from "./ApiConstants";
import apiRequest from "./request";

export const getStepOptions = async () => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.ML_URI,
    apiConsts.ML_ENDPOINTS.TRAIN + "/pipeline/options"
  );
  return res;
};

export const getModels = async () => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.ML_URI,
    apiConsts.ML_ENDPOINTS.MODELS
  );
  return res;
};

export const getModel = async (modelId) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.ML_URI,
    apiConsts.ML_ENDPOINTS.MODELS + `/${modelId}`
  );
  return res;
};

export const updateModel = async (model) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.PUT,
    apiConsts.ML_URI,
    apiConsts.ML_ENDPOINTS.MODELS + `/${model._id}`,
    model
  );
  return res;
};

export const deleteModel = async (modelId) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.DELETE,
    apiConsts.ML_URI,
    apiConsts.ML_ENDPOINTS.MODELS + `/${modelId}`
  );
  return res;
};

export const getTrainConfig = async () => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.ML_URI,
    apiConsts.ML_ENDPOINTS.TRAIN
  );
  return res;
};

export const train = async (data) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.POST,
    apiConsts.ML_URI,
    apiConsts.ML_ENDPOINTS.TRAIN,
    data
  );
  return res;
};

export const preflightTrain = async (data) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.POST,
    apiConsts.ML_URI,
    apiConsts.ML_ENDPOINTS.TRAIN + "/preflight",
    data
  );
  return res;
};

export const getDeployDevices = async (id) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.ML_URI,
    apiConsts.ML_ENDPOINTS.DEPLOY + "/" + id
  );
  return res;
};

export const deployModel = async (
  id,
  tsMap,
  parameters,
  selectedDevice,
  additionalSettings
) =>
  apiRequest(
    apiConsts.HTTP_METHODS.POST,
    apiConsts.ML_URI,
    apiConsts.ML_ENDPOINTS.DEPLOY + "/" + id,
    {
      tsMap,
      parameters,
      device: selectedDevice,
      additionalSettings,
    },
    {},
    "application/json",
    "arraybuffer"
  );

export const downloadFirmware = async (
  id,
  tsMap,
  parameters,
  selectedDevice,
  additionalSettings
) =>
  apiRequest(
    apiConsts.HTTP_METHODS.POST,
    apiConsts.ML_URI,
    apiConsts.ML_ENDPOINTS.DEPLOY + "/" + id + "/download",
    {
      tsMap,
      parameters,
      device: selectedDevice,
      additionalSettings,
    },
    {},
    "application/json",
    "arraybuffer"
  );
