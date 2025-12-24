import apiConsts from "./ApiConstants";
import apiRequest from "./request";
import { getCurrentProjectId } from "./projectContext";

export const setDeviceApiKey = async () => {
  const projectId = getCurrentProjectId();
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.PUT,
    apiConsts.API_URI,
    `${projectId}/external_api/`
  );
  return res;
};

export const getDeviceApiKey = async () => {
  const projectId = getCurrentProjectId();
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.API_URI,
    `${projectId}/external_api/`
  );
  return res;
};

export const deleteDeviceApiKey = async () => {
  const projectId = getCurrentProjectId();
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.DELETE,
    apiConsts.API_URI,
    `${projectId}/external_api/`
  );
  return res;
};

export const switchDeviceApiActive = async (activeState) => {
  const projectId = getCurrentProjectId();
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.POST,
    apiConsts.API_URI,
    `${projectId}/external_api/switch/${activeState}`
  );
  return res;
};
