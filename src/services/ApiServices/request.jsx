import ax from "axios";
import localStorageService from "./../LocalStorageService";
import {
  HTTP_METHODS,
  API_URI,
  API_ENDPOINTS,
  AUTH_URI,
  AUTH_ENDPOINTS,
} from "./ApiConstants";
import useProjectStore from "../../stores/projectStore";

const axios = ax.create();

const buildRequestConfig = ({
  method = HTTP_METHODS.GET,
  baseUri = API_URI,
  endpoint = API_ENDPOINTS.DEFAULT,
  body = {},
  params = {},
  contentType = "application/json",
  responseType = "json",
}) => {
  const { currentProject } = useProjectStore.getState();
  return {
    method,
    url: baseUri + endpoint,
    data: body,
    params,
    headers: {
      "Content-Type": contentType,
      ...(currentProject && { project: currentProject.id }),
      Authorization: localStorageService.getAccessToken(),
    },
    responseType,
    withCredentials: true,
  };
};

const refreshAccessToken = async () => {
  const refreshToken = localStorageService.getRefreshToken();
  if (!refreshToken) {
    return null;
  }
  const res = await axios({
    method: HTTP_METHODS.POST,
    url: AUTH_URI + AUTH_ENDPOINTS.REFRESH,
    data: { refresh_token: refreshToken },
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
  return res.data;
};

const apiRequest = async (...args) => {
  const isConfigObject = args.length === 1 && typeof args[0] === "object";
  const options = isConfigObject
    ? args[0]
    : {
        method: args[0],
        baseUri: args[1],
        endpoint: args[2],
        body: args[3],
        params: args[4],
        contentType: args[5],
        responseType: args[6],
      };

  const requestConfig = buildRequestConfig(options);

  try {
    const res = await axios(requestConfig);
    return res.data;
  } catch (error) {
    const status = error?.response?.status;
    if (status !== 401 || options?.skipAuthRefresh) {
      throw error;
    }

    if (requestConfig.__isRetry) {
      throw error;
    }

    const refreshData = await refreshAccessToken();
    const accessToken = refreshData?.access_token;
    const refreshToken = refreshData?.refresh_token;
    if (!accessToken) {
      throw error;
    }

    localStorageService.setToken(accessToken, refreshToken);
    const retryConfig = {
      ...requestConfig,
      __isRetry: true,
      headers: {
        ...requestConfig.headers,
        Authorization: accessToken,
      },
    };

    const retryRes = await axios(retryConfig);
    return retryRes.data;
  }
};

export default apiRequest;
