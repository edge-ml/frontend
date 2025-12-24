import apiConsts from "./ApiConstants";
import ax from "axios";
import apiRequest from "./request";
import { getCurrentProjectId } from "./projectContext";
import localStorageService from "./../LocalStorageService";

const axios = ax.create();

export const processCSVBackend = (formData, fileId, handleProgress) => {
  const source = ax.CancelToken.source();
  const projectId = getCurrentProjectId();
  const cancellationHandler = () => {
    source.cancel("Operation cancelled by the user");
  };

  const axiosInput = {
    ...apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.POST,
      apiConsts.DATASET_STORE,
      `${projectId}/datasets/csv`,
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
      project: projectId,
      Authorization: localStorageService.getAccessToken(),
    },
    withCredentials: true,
  };

  const req = axios(axiosInput);

  return [cancellationHandler, req];
};
