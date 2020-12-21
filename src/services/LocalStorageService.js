module.exports.setToken = function(accessToken, refreshToken) {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

module.exports.getAccessToken = function() {
  return localStorage.getItem('access_token');
};

module.exports.getRefreshToken = function() {
  return localStorage.getItem('refresh_token');
};

module.exports.clearToken = function() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('project_id');
};

module.exports.setProject = function(project_id) {
  localStorage.setItem('project_id', project_id);
};

module.exports.getProject = function() {
  return localStorage.getItem('project_id');
};
