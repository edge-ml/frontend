import {
  DATASET_STORE,
  DATASET_STORE_ENDPOINTS,
  HTTP_METHODS,
} from "./ApiConstants";
import apiRequest from "./request";

export const getLabelings = async () => {
  const res = await apiRequest(
    HTTP_METHODS.GET,
    DATASET_STORE,
    DATASET_STORE_ENDPOINTS.LABELING
  );
  return res;
};

export const updateLabeling = async (labeling) => {
  console.log(labeling);
  const res = await apiRequest(
    HTTP_METHODS.PUT,
    DATASET_STORE,
    DATASET_STORE_ENDPOINTS.LABELING + `${labeling._id}`,
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
  const res = await apiRequest(
    HTTP_METHODS.DELETE,
    DATASET_STORE,
    DATASET_STORE_ENDPOINTS.LABELING + `${labelingId}`
  );
  return res;
};
