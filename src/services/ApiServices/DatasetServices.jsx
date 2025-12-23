import apiConsts from "./ApiConstants";
import ax from "axios";
import apiRequest from "./request";
import useProjectStore from "../../stores/projectStore";

const axios = ax.create();

export const getDatasets = async (project) => {
  const { currentProject } = useProjectStore.getState();
  const projectId = currentProject?.id || currentProject?.id || currentProject;

  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.DATASET_STORE,
    // apiConsts.DATASET_STORE_ENDPOINTS.DATASETS
    `${projectId}/datasets`
  );
  return res;
};

export const getDatasetsPagination = async (skip, limit, sort) => {
  const { currentProject } = useProjectStore.getState();
  const projectId = currentProject?.id || currentProject?.id || currentProject;
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.DATASET_STORE,
    `${projectId}/datasets/view`,
    {},
    { skip: skip, limit: limit, sort: sort }
  );
  return res;
};

export const updateDataset = async (dataset) => {
  const { currentProject } = useProjectStore.getState();
  const projectId = currentProject?.id || currentProject?.id || currentProject;
  const datasetId = dataset?.id || dataset?._id;
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.PUT,
    apiConsts.DATASET_STORE,
    `${projectId}/${apiConsts.DATASET_STORE_ENDPOINTS.DATASETS}${datasetId}`,
    dataset
  );
  return res;
};

export const getDatasetTimeseries = (id, info) => {
  const { currentProject } = useProjectStore.getState();
  const projectId = currentProject?.id || currentProject?.id || currentProject;

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
  const { currentProject } = useProjectStore.getState();
  const projectId = currentProject?.id || currentProject?.id || currentProject;


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
  const { currentProject } = useProjectStore.getState();
  const projectId = currentProject?.id || currentProject?.id || currentProject;


  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.DATASET_STORE,
    projectId + "/" + apiConsts.DATASET_STORE_ENDPOINTS.DATASETS + `${id}`
  );
  return res;
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
  const { currentProject } = useProjectStore.getState();
  const projectId = currentProject?.id || currentProject?.id || currentProject;
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.DELETE,
    apiConsts.DATASET_STORE,
    `${projectId}/${apiConsts.DATASET_STORE_ENDPOINTS.DATASETS}${datasetId}`
  );
  return res;
};

export const createDataset = async (dataset) => {
  const { currentProject } = useProjectStore.getState();
  const projectId = currentProject?.id || currentProject?.id || currentProject;
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.POST,
    apiConsts.DATASET_STORE,
    `${projectId}/${apiConsts.DATASET_STORE_ENDPOINTS.DATASETS}`,
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
  const { currentProject } = useProjectStore.getState();
  const projectId = currentProject?.id || currentProject?.id || currentProject;
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.POST,
    apiConsts.DATASET_STORE,
    `${projectId}/${apiConsts.DATASET_STORE_ENDPOINTS.DATASETS}` +
      `${dataset["_id"]}/append`,
    data
  );
  return res;
};

export const getUploadProcessingProgress = async (datasetId) => {
  const { currentProject } = useProjectStore.getState();
  const projectId = currentProject?.id || currentProject?.id || currentProject;
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.DATASET_STORE,
    `${projectId}/${apiConsts.DATASET_STORE_ENDPOINTS.GET_PROCESSING_PROGRESS}` +
      `?datasetId=${datasetId}`
  );
  return res;
};

export const updateTimeSeriesConfig = async (
  datasetId,
  tsId,
  unit,
  scaling,
  offset
) => {
  const { currentProject } = useProjectStore.getState();
  const projectId = currentProject?.id || currentProject?.id || currentProject;
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.PUT,
    apiConsts.DATASET_STORE,
    `${projectId}/${apiConsts.DATASET_STORE_ENDPOINTS.DATASETS}` +
      `${datasetId}/changeUnitConfig?tsId=${tsId}&unit=${unit}&scaling=${scaling}&offset=${offset}`
  );
  return res;
};
