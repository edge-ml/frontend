import apiConsts from "./ApiConstants";
import ax from "axios";
import apiRequest from "./request";

const axios = ax.create();

export const getDatasets = async (project) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.DATASET_STORE,
    apiConsts.DATASET_STORE_ENDPOINTS.DATASETS
  );
  return res;
};

export const getDatasetsPagination = async (skip, limit, sort) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.DATASET_STORE,
    apiConsts.DATASET_STORE_ENDPOINTS.DATASETS + "view",
    {},
    { skip: skip, limit: limit, sort: sort }
  );
  return res;
};

export const updateDataset = async (dataset) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.PUT,
    apiConsts.DATASET_STORE,
    apiConsts.DATASET_STORE_ENDPOINTS.DATASETS + `${dataset["_id"]}`,
    dataset
  );
  return res;
};

export const getDatasetTimeseries = (id, info) => {
  const { max_resolution, start, end } = info;
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.DATASET_STORE,
        apiConsts.DATASET_STORE_ENDPOINTS.DATASETS +
          `${id}/ts/${start}/${end}/${max_resolution}`
      )
    )
      .then((data) => resolve(data.data))
      .catch((err) => reject(err.response));
  });
};

export const getTimeSeriesDataPartial = (id, ts_ids, info) => {
  const { max_resolution, start, end } = info;
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.DATASET_STORE,
        apiConsts.DATASET_STORE_ENDPOINTS.DATASETS +
          `${id}/ts/${start}/${end}/${max_resolution}`,
        ts_ids
      )
    )
      .then((data) => resolve(data.data))
      .catch((err) => reject(err.response));
  });
};

export const getDataset = async (id) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.DATASET_STORE,
    apiConsts.DATASET_STORE_ENDPOINTS.DATASETS + `${id}`
  );
  return res;

}

export const deleteDatasets = (ids) => {
  try {
    const promises = ids.map((elm) => deleteDataset(elm));
    return Promise.all(promises);
  } catch (e) {
    return e;
  }
};

export const deleteDataset = async (datasetId) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.DELETE,
    apiConsts.DATASET_STORE,
    apiConsts.DATASET_STORE_ENDPOINTS.DATASETS + `${datasetId}`
  );
  return res;
};

export const createDataset = async (dataset) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.POST,
    apiConsts.DATASET_STORE,
    apiConsts.DATASET_STORE_ENDPOINTS.DATASETS,
    dataset
  );
  return res;
};

export const createDatasets = async (datasets) => {
  const res = await Promise.all(
    datasets.map((dataset) => createDataset(dataset))
  );
  const newDatasets = await getDatasets();
  return newDatasets;
};

export const appendToDataset = async (dataset, data) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.POST,
    apiConsts.DATASET_STORE,
    apiConsts.DATASET_STORE_ENDPOINTS.DATASETS +
      `${dataset["_id"]}` +
      "/append",
    data
  );
  return res;
};

export const getUploadProcessingProgress = async (datasetId) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.DATASET_STORE,
    apiConsts.DATASET_STORE_ENDPOINTS.GET_PROCESSING_PROGRESS +
      `?datasetId=${datasetId}`
  );
  return res;
};

export const updateTimeSeriesConfig = async (datasetId, tsId, unit, scaling, offset) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.PUT,
    apiConsts.DATASET_STORE,
    apiConsts.DATASET_STORE_ENDPOINTS.DATASETS +
      `${datasetId}/changeUnitConfig?tsId=${tsId}&unit=${unit}&scaling=${scaling}&offset=${offset}`
  );
  return res;
};