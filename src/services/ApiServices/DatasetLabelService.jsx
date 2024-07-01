import exp from "constants";
import apiConsts from "./ApiConstants";
import ax from "axios";
import apiRequest from "./request";

const axios = ax.create();
const axiosNoToken = ax.create();

export const createDatasetLabel = async (datasetId, labeling) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.POST,
    apiConsts.DATASET_STORE,
    apiConsts.DATASET_STORE_ENDPOINTS.DATASET_LABELINGS +
      `${datasetId}/${labelingId}`,
    label
  );
  return res;
};

export const changeDatasetLabel = async (datasetId, labelingId, changedLabel) => {
  changedLabel.start = Math.ceil(changedLabel.start);
  changedLabel.end = Math.floor(changedLabel.end);
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.PUT,
    apiConsts.DATASET_STORE,
    apiConsts.DATASET_STORE_ENDPOINTS.DATASET_LABELINGS +
      `${datasetId}/${labelingId}/${changedLabel._id}`,
    changedLabel
  );
  return res;
};

export const deleteDatasetLabel = async(datasetId, labelingId, labelId) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.DELETE,
    apiConsts.DATASET_STORE,
    apiConsts.DATASET_STORE_ENDPOINTS.DATASET_LABELINGS +
      `${datasetId}/${labelingId}/${labelId}`
  );
  return res;
};
