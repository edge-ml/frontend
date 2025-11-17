import ax from "axios";
import localStorageService from "./../LocalStorageService";
import { HTTP_METHODS, API_URI, API_ENDPOINTS } from "./ApiConstants";
const axios = ax.create();

const useApiCalls = (currentProject) => {
  const request = async (
    method = HTTP_METHODS.GET,
    baseUri = API_URI,
    endpoint = API_ENDPOINTS.DEFAULT,
    body = {},
    params = {},
    contentType = "application/json"
  ) => {
    const project = currentProject ? currentProject._id : undefined;
    const requestConfig = {
      method: method,
      url: baseUri + endpoint,
      data: body,
      params: params,
      headers: {
        "Content-Type": contentType,
        ...(project && { project: project }),
        Authorization: localStorageService.getAccessToken(),
      },
    };
    const res = await axios(requestConfig);
    return res.data;
  };
  return {
    request: request,
  };
};

export default useApiCalls;
