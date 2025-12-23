import exp from "constants";
import apiConsts from "./ApiConstants";
import ax from "axios";
import apiRequest from "./request";
import useProjectStore from "../../stores/projectStore";

const axios = ax.create();
const axiosNoToken = ax.create();

export const createDatasetLabel = async (datasetId, labelingId, label) => {
  const { currentProject } = useProjectStore.getState();
  const projectId = currentProject?.id || currentProject?.id || currentProject;
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.POST,
    apiConsts.DATASET_STORE,
    `${projectId}/${apiConsts.DATASET_STORE_ENDPOINTS.DATASET_LABELINGS}` +
      `${datasetId}/${labelingId}`,
    label
  );
  return res;
};

export const changeDatasetLabel = async (
  datasetId,
  labelingId,
  changedLabel
) => {
  const { currentProject } = useProjectStore.getState();
  const projectId = currentProject?.id || currentProject?.id || currentProject;
  changedLabel.start = Math.ceil(changedLabel.start);
  changedLabel.end = Math.floor(changedLabel.end);
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.PUT,
    apiConsts.DATASET_STORE,
    `${projectId}/${apiConsts.DATASET_STORE_ENDPOINTS.DATASET_LABELINGS}` +
      `${datasetId}/${labelingId}/${changedLabel.id}`,
    changedLabel
  );
  return res;
};

export const deleteDatasetLabel = async (datasetId, labelingId, labelId) => {
  const { currentProject } = useProjectStore.getState();
  const projectId = currentProject?.id || currentProject?.id || currentProject;
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.DELETE,
    apiConsts.DATASET_STORE,
    `${projectId}/${apiConsts.DATASET_STORE_ENDPOINTS.DATASET_LABELINGS}` +
      `${datasetId}/${labelingId}/${labelId}`
  );
  return res;
};
