const localStorageService = require('./../LocalStorageService');

module.exports = {
  AUTH_URI:
    process.env.NODE_ENV === 'production' ? '/auth/' : 'http://localhost/auth/',
  API_URI:
    process.env.NODE_ENV === 'production' ? '/api/' : 'http://localhost/api/',

  //AUTH_URI: 'http://localhost:3002/auth/',
  //API_URI: 'http://localhost:3000/api/',

  HTTP_METHODS: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE'
  },

  AUTH_ENDPOINTS: {
    DEFAULT: '/',
    LOGIN: 'login',
    DELETE: 'unregister',
    REGISTER: 'register',
    USERS: 'USERS',
    INIT2FA: '2fa/init',
    VERIFY2FA: '2fa/verify',
    RESET2FA: '2fa/reset',
    MAIL: 'mail',
    CHANGE_MAIL: 'changeMail',
    USERNAMESUGGEST: 'userNameSuggest',
    CHANGE_PASSWORD: 'changePassword',
    ID: 'id',
    CHANGE_USERNAME: 'changeUserName',
    USERNAME: 'userName'
  },
  API_ENDPOINTS: {
    DATASETS: 'datasets',
    LABEL_DEFINITIONS: 'labelDefinitions',
    LABEL_TYPES: 'labelTypes',
    EXPERIMENTS: 'experiments',
    PROJECTS: 'projects'
  }
};

module.exports.generateApiRequest = (
  method = this.HTTP_METHODS.GET,
  baseUri = this.API_URI,
  endpoint = this.API_ENDPOINTS.DEFAULT,
  body = {}
) => {
  const project = localStorageService.getProject();
  return {
    method: method,
    url: baseUri + endpoint,
    data: body,
    headers: {
      'Content-Type': 'application/json',
      ...(project && { project: project }),
      Authorization: localStorageService.getAccessToken()
    }
  };
};
