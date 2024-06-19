import apiRequest from "./request";
import { HTTP_METHODS, DATASET_STORE, DATASET_STORE_ENDPOINTS } from "./ApiConstants";


export const getTimeSeriesDataPartial = async (dataset_id, ts_id, start, end, max_resolution) => {
  const res = await apiRequest(
    HTTP_METHODS.GET,
    DATASET_STORE,
    DATASET_STORE_ENDPOINTS.DATASETS +
    `${dataset_id}/ts/${ts_id}/${start}/${end}/${max_resolution}`,
  );
  return res;
};