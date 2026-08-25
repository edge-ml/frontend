export const setToken = function (accessToken, refreshToken) {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
};

export const getAccessToken = function () {
  return localStorage.getItem("access_token");
};

/**
 * Returns the access token formatted for the Authorization header
 * ("Bearer <token>") or null when no token is stored.
 */
export const getAuthHeader = function () {
  const token = getAccessToken();
  if (!token) return null;
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
};

export const getRefreshToken = function () {
  return localStorage.getItem("refresh_token");
};

export const clearToken = function () {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("project_id");
};

export const setProject = function (project_id) {
  localStorage.setItem("project_id", project_id);
};

export const clearProject = function () {
  localStorage.removeItem("project_id");
};

export const getProject = function () {
  return localStorage.getItem("project_id");
};

const expObj = {
  setToken,
  getAccessToken,
  getAuthHeader,
  getRefreshToken,
  clearToken,
  setProject,
  clearProject,
  getProject,
};
export default expObj;
