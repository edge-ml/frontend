import { getUserIds } from "../ApiServices/AuthentificationServices";
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
  const userData = await getUserIds(project.users.map((elm) => elm.userName));
  project.users = userData;
  const res = await apiRequest(
    HTTP_METHODS.POST,
    API_URI,
    API_ENDPOINTS.PROJECTS,
    project
  );
  return res;
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
