import apiConsts from "./ApiConstants";
import ax from "axios";
import useProjectStore from "../../stores/projectStore";
import localStorageService from "./../LocalStorageService";

const axios = ax.create();

// Sends a CSV file to the dataset store: as a new dataset, or, with
// `datasetId`, added to that dataset. Returns [cancel, request]; the request
// resolves to the axios response (the new dataset, or { dataset, added,
// skippedLabels }).
export const processCSVBackend = (formData, fileId, handleProgress, datasetId) => {
  const source = ax.CancelToken.source();
  const { currentProject } = useProjectStore.getState();

  const cancellationHandler = () => {
    source.cancel("Operation cancelled by the user");
  };

  const axiosInput = {
    ...apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.POST,
      apiConsts.DATASET_STORE,
      datasetId
        ? apiConsts.DATASET_STORE_ENDPOINTS.DATASETS + `${datasetId}/csv`
        : apiConsts.DATASET_STORE_ENDPOINTS.CREATE_DATASET,
      formData,
      {},
      "multipart/form-data"
    ),
    onUploadProgress: (progressEvent) => {
      const progress = (progressEvent.loaded / progressEvent.total) * 100;
      handleProgress(fileId, progress);
    },
    cancelToken: source.token,
    headers: {
      project: currentProject._id,
      Authorization: localStorageService.getAuthHeader(),
    },
    withCredentials: true,
  };

  const req = axios(axiosInput);

  return [cancellationHandler, req];
};
