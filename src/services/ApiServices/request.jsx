import ax from "axios";
import localStorageService from "./../LocalStorageService";
import { HTTP_METHODS, API_URI, API_ENDPOINTS } from "./ApiConstants";
import useProjectStore from "../../stores/projectStore";

const axios = ax.create();

const apiRequest = async (
  method = HTTP_METHODS.GET,
  baseUri = API_URI,
  endpoint = API_ENDPOINTS.DEFAULT,
  body = {},
  params = {},
  contentType = "application/json",
  responseType = "json"
) => {
  // Get the current project from the store
  const { currentProject } = useProjectStore.getState();

  const requestConfig = {
    method: method,
    url: baseUri + endpoint,
    data: body,
    params: params,
    headers: {
      "Content-Type": contentType,
      ...(currentProject && { project: currentProject._id }), // Add project ID to headers if it exists
      Authorization: localStorageService.getAccessToken(),
    },
    responseType: responseType,
    withCredentials: true,
  };

  try {
    const res = await axios(requestConfig);
    return res.data;
  } catch (error) {
    // Surface the backend's error message instead of axios' generic
    // "Request failed with status code 500".
    const serverMessage =
      error.response?.data?.error || error.response?.data?.message;
    const normalized = new Error(serverMessage || error.message);
    normalized.status = error.response?.status;
    throw normalized;
  }
};

export default apiRequest;
