import { HTTP_METHODS, API_URI, API_ENDPOINTS } from "./ApiConstants";
import apiRequest from "./request";

export const getProjects = async () => {
  const res = await apiRequest(
    HTTP_METHODS.GET,
    API_URI,
    API_ENDPOINTS.PROJECTS
  );
  return res;
};

export const createProject = async (project) => {
  const res = await apiRequest(
    HTTP_METHODS.POST,
    API_URI,
    API_ENDPOINTS.PROJECTS,
    { name: project.name }
  );
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
  const res = await apiRequest(
    HTTP_METHODS.DELETE,
    API_URI,
    API_ENDPOINTS.PROJECTS + `/${projectId}`
  );
  return res;
};

export const leaveProject = async (projectId) => {
  const res = await apiRequest(
    HTTP_METHODS.DELETE,
    API_URI,
    API_ENDPOINTS.PROJECTS + `/${projectId}/leave`
  );
  return res;
};

export const updateProject = async (project) => {
  const res = await apiRequest(
    HTTP_METHODS.PUT,
    API_URI,
    API_ENDPOINTS.PROJECTS + `/${project.id}`,
    project
  );
  return res;
};

export const addProjectUser = async (projectId, username) => {
  const res = await apiRequest(
    HTTP_METHODS.POST,
    API_URI,
    API_ENDPOINTS.PROJECTS + `/${projectId}/users`,
    { username }
  );
  return res;
};
