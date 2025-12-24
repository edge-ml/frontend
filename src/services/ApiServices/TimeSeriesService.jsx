import apiRequest from "./request";
import {
  HTTP_METHODS,
  DATASET_STORE,
  DATASET_STORE_ENDPOINTS,
} from "./ApiConstants";
import { getCurrentProjectId } from "./projectContext";

export const getTimeSeriesDataPartial = async (
  dataset_id,
  ts_id,
  start,
  end,
  max_resolution
) => {
  const projectId = getCurrentProjectId();
  return apiRequest({
    method: HTTP_METHODS.GET,
    baseUri: DATASET_STORE,
    endpoint:
      `${projectId}/${DATASET_STORE_ENDPOINTS.DATASETS}` +
      `${dataset_id}/ts/${ts_id}/${start}/${end}/${max_resolution}`,
  });
};
