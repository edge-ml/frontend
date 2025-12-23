import apiConsts from "./ApiConstants";
import apiRequest from "./request";
import useProjectStore from "../../stores/projectStore";

const buildDatasetLabelPayload = (labelingId, label) => ({
  labeling: labelingId,
  label: label?.type ?? label?.label ?? label?.id,
  start: label?.start,
  end: label?.end,
  metaData: label?.metaData,
});

export const createDatasetLabel = async (datasetId, labelingId, label) => {
  const { currentProject } = useProjectStore.getState();
  const projectId = currentProject?.id || currentProject?.id || currentProject;
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
  const { currentProject } = useProjectStore.getState();
  const projectId = currentProject?.id || currentProject?.id || currentProject;
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
  const { currentProject } = useProjectStore.getState();
  const projectId = currentProject?.id || currentProject?.id || currentProject;
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.DELETE,
    apiConsts.API_URI,
    `${projectId}/dataset_labels/${datasetId}/labels/${labelId}/`
  );
  return res;
};
