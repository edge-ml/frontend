import ax from 'axios';
import localStorageService from './../LocalStorageService';
import { HTTP_METHODS, API_URI, API_ENDPOINTS } from './ApiConstants';
import useProjectStore from '../../stores/projectStore';

const axios = ax.create();

const apiRequest = async (
  method = HTTP_METHODS.GET,
  baseUri = API_URI,
  endpoint = API_ENDPOINTS.DEFAULT,
  body = {},
  params = {},
  contentType = 'application/json'
) => {
  // Get the current project from the store
  const { currentProject } = useProjectStore.getState();

  const requestConfig = {
    method: method,
    url: baseUri + endpoint,
    data: body,
    params: params,
    headers: {
      'Content-Type': contentType,
      ...(currentProject && { project: currentProject._id }), // Add project ID to headers if it exists
      Authorization: localStorageService.getAccessToken(),
    },
  };

  const res = await axios(requestConfig);
  return res.data;
};

export default apiRequest;
