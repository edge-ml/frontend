import apiConsts from "./ApiConstants";
import ax from "axios";
import apiRequest from "./request";
import { getCurrentProjectId } from "./projectContext";

const axios = ax.create();

export const getDatasets = async (project) => {
  const projectId = getCurrentProjectId();

  return apiRequest({
    method: apiConsts.HTTP_METHODS.GET,
    baseUri: apiConsts.DATASET_STORE,
    endpoint: `${projectId}/datasets`,
  });
};

export const getDatasetsPagination = async (skip, limit, sort) => {
  const projectId = getCurrentProjectId();
  return apiRequest({
    method: apiConsts.HTTP_METHODS.GET,
    baseUri: apiConsts.DATASET_STORE,
    endpoint: `${projectId}/datasets/view`,
    params: { skip: skip, limit: limit, sort: sort },
  });
};

export const updateDataset = async (dataset) => {
  const projectId = getCurrentProjectId();
  const datasetId = dataset?.id || dataset?._id;
  return apiRequest({
    method: apiConsts.HTTP_METHODS.PUT,
    baseUri: apiConsts.DATASET_STORE,
    endpoint: `${projectId}/${apiConsts.DATASET_STORE_ENDPOINTS.DATASETS}${datasetId}`,
    body: dataset,
  });
};

export const getDatasetTimeseries = (id, info) => {
  const projectId = getCurrentProjectId();

  const { max_resolution, start, end } = info;
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.DATASET_STORE,
        projectId + "/" + apiConsts.DATASET_STORE_ENDPOINTS.DATASETS +
          `${id}/ts/${start}/${end}/${max_resolution}`
      )
    )
      .then((data) => resolve(data.data))
      .catch((err) => reject(err.response));
  });
};

export const getTimeSeriesDataPartial = (id, ts_ids, info) => {
  const projectId = getCurrentProjectId();


  const { max_resolution, start, end } = info;
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.DATASET_STORE,
        projectId + "/" + apiConsts.DATASET_STORE_ENDPOINTS.DATASETS +
          `${id}/ts/${start}/${end}/${max_resolution}`,
        ts_ids
      )
    )
      .then((data) => resolve(data.data))
      .catch((err) => reject(err.response));
  });
};

export const getDataset = async (id) => {
  const projectId = getCurrentProjectId();


  return apiRequest({
    method: apiConsts.HTTP_METHODS.GET,
    baseUri: apiConsts.DATASET_STORE,
    endpoint: projectId + "/" + apiConsts.DATASET_STORE_ENDPOINTS.DATASETS + `${id}`,
  });
};

export const deleteDatasets = (ids) => {
  try {
    const promises = ids.map((elm) => deleteDataset(elm));
    return Promise.all(promises);
  } catch (e) {
    return e;
  }
};

export const deleteDataset = async (datasetId) => {
  const projectId = getCurrentProjectId();
  return apiRequest({
    method: apiConsts.HTTP_METHODS.DELETE,
    baseUri: apiConsts.DATASET_STORE,
    endpoint: `${projectId}/${apiConsts.DATASET_STORE_ENDPOINTS.DATASETS}${datasetId}`,
  });
};

export const createDataset = async (dataset) => {
  const projectId = getCurrentProjectId();
  return apiRequest({
    method: apiConsts.HTTP_METHODS.POST,
    baseUri: apiConsts.DATASET_STORE,
    endpoint: `${projectId}/${apiConsts.DATASET_STORE_ENDPOINTS.DATASETS}`,
    body: dataset,
  });
};

export const createDatasets = async (datasets) => {
  const res = await Promise.all(
    datasets.map((dataset) => createDataset(dataset))
  );
  const newDatasets = await getDatasets();
  return newDatasets;
};

export const appendToDataset = async (dataset, data) => {
  const projectId = getCurrentProjectId();
  const datasetId = dataset?.id || dataset?._id;
  return apiRequest({
    method: apiConsts.HTTP_METHODS.POST,
    baseUri: apiConsts.DATASET_STORE,
    endpoint:
      `${projectId}/${apiConsts.DATASET_STORE_ENDPOINTS.DATASETS}` +
      `${datasetId}/append`,
    body: data,
  });
};

export const getUploadProcessingProgress = async (datasetId) => {
  const projectId = getCurrentProjectId();
  return apiRequest({
    method: apiConsts.HTTP_METHODS.GET,
    baseUri: apiConsts.DATASET_STORE,
    endpoint: `${projectId}/${apiConsts.DATASET_STORE_ENDPOINTS.GET_PROCESSING_PROGRESS}`,
    params: { datasetId },
  });
};

export const updateTimeSeriesConfig = async (
  datasetId,
  tsId,
  unit,
  scaling,
  offset
) => {
  const projectId = getCurrentProjectId();
  return apiRequest({
    method: apiConsts.HTTP_METHODS.PUT,
    baseUri: apiConsts.DATASET_STORE,
    endpoint: `${projectId}/${apiConsts.DATASET_STORE_ENDPOINTS.DATASETS}${datasetId}/changeUnitConfig`,
    params: { tsId, unit, scaling, offset },
  });
};

export const updateDatasetMetadata = async (datasetId, metaData) => {
  const projectId = getCurrentProjectId();
  return apiRequest({
    method: apiConsts.HTTP_METHODS.PUT,
    baseUri: apiConsts.DATASET_STORE,
    endpoint: `${projectId}/datasets/${datasetId}/metadata`,
    body: metaData,
  });
};
