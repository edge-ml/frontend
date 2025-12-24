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
  return apiRequest({
    method: HTTP_METHODS.PUT,
    baseUri: DATASET_STORE,
    endpoint: `${projectId}/labelings/${labeling.id}`,
    body: labeling,
  });
};

export const addLabeling = async (labeling) => {
  const projectId = getCurrentProjectId();
  return apiRequest({
    method: HTTP_METHODS.POST,
    baseUri: DATASET_STORE,
    endpoint: `${projectId}/labelings/`,
    body: labeling,
  });
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
