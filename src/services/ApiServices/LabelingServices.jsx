import {
  API_ENDPOINTS,
  API_URI,
  DATASET_STORE,
  DATASET_STORE_ENDPOINTS,
  HTTP_METHODS,
} from "./ApiConstants";
import apiRequest from "./request";
import { getCurrentProjectId } from "./projectContext";

export const getLabelings = async () => {
  const projectId = getCurrentProjectId();

  const res = await apiRequest(
    HTTP_METHODS.GET,
    API_URI,
    `${projectId}/labelings`
  );
  return res;
};

export const updateLabeling = async (labeling) => {
  console.log(labeling);
  const projectId = getCurrentProjectId();
  const res = await apiRequest(
    HTTP_METHODS.PUT,
    DATASET_STORE,
    `${projectId}/labelings`,
    labeling
  );
  return res;
};

export const addLabeling = async (labeling) => {
  const res = await apiRequest(
    HTTP_METHODS.POST,
    DATASET_STORE,
    DATASET_STORE_ENDPOINTS.LABELING,
    labeling
  );
  return res;
};

export const deleteLabeling = async (labelingId, conflictingDatasetIds) => {
  const projectId = getCurrentProjectId();
  const res = await apiRequest(
    HTTP_METHODS.DELETE,
    API_URI,
    `${projectId}/labelings/${labelingId}`
  );
  return res;
};
