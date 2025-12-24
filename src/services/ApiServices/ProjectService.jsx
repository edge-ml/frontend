import { HTTP_METHODS, API_URI, API_ENDPOINTS } from "./ApiConstants";
import apiRequest from "./request";

export const getProjects = async () => {
  return apiRequest({
    method: HTTP_METHODS.GET,
    baseUri: API_URI,
    endpoint: API_ENDPOINTS.PROJECTS,
  });
};

export const createProject = async (project) => {
  const res = await apiRequest({
    method: HTTP_METHODS.POST,
    baseUri: API_URI,
    endpoint: API_ENDPOINTS.PROJECTS,
    body: { name: project.name },
  });
  const userNames = (project.users || [])
    .map((elm) => elm.userName)
    .filter((name) => name && name !== project.admin?.userName);
  if (!res?.id || userNames.length === 0) {
    return res;
  }
  let current = res;
  for (const userName of userNames) {
    current = await addProjectUser(res.id, userName);
  }
  return current;
};

export const deleteProject = async (projectId) => {
  return apiRequest({
    method: HTTP_METHODS.DELETE,
    baseUri: API_URI,
    endpoint: `${API_ENDPOINTS.PROJECTS}/${projectId}`,
  });
};

export const leaveProject = async (projectId) => {
  return apiRequest({
    method: HTTP_METHODS.DELETE,
    baseUri: API_URI,
    endpoint: `${API_ENDPOINTS.PROJECTS}/${projectId}/leave`,
  });
};

export const updateProject = async (project) => {
  return apiRequest({
    method: HTTP_METHODS.PUT,
    baseUri: API_URI,
    endpoint: `${API_ENDPOINTS.PROJECTS}/${project.id}`,
    body: project,
  });
};

export const addProjectUser = async (projectId, username) => {
  return apiRequest({
    method: HTTP_METHODS.POST,
    baseUri: API_URI,
    endpoint: `${API_ENDPOINTS.PROJECTS}/${projectId}/users`,
    body: { username },
  });
};
