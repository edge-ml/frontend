import apiConsts from "./ApiConstants";
import apiRequest from "./request";
import { getCurrentProjectId } from "./projectContext";

const buildDatasetLabelPayload = (labelingId, label) => ({
  labeling: labelingId,
  label: label?.type ?? label?.label ?? label?.id,
  start: label?.start,
  end: label?.end,
  metaData: label?.metaData,
});

export const createDatasetLabel = async (datasetId, labelingId, label) => {
  const projectId = getCurrentProjectId();
  const payload = buildDatasetLabelPayload(labelingId, label);
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.POST,
    apiConsts.API_URI,
    `${projectId}/dataset_labels/${datasetId}/labels/`,
    payload
  );
  return res;
};

export const changeDatasetLabel = async (
  datasetId,
  labelingId,
  changedLabel
) => {
  const projectId = getCurrentProjectId();
  const labelId = changedLabel?.id;
  const payload = buildDatasetLabelPayload(labelingId, {
    ...changedLabel,
    start: Math.ceil(changedLabel.start),
    end: Math.floor(changedLabel.end),
  });
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.PUT,
    apiConsts.API_URI,
    `${projectId}/dataset_labels/${datasetId}/labels/${labelId}/`,
    payload
  );
  return res;
};

export const deleteDatasetLabel = async (datasetId, labelingId, labelId) => {
  const projectId = getCurrentProjectId();
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.DELETE,
    apiConsts.API_URI,
    `${projectId}/dataset_labels/${datasetId}/labels/${labelId}/`
  );
  return res;
};
