const localStorageService = require('./../LocalStorageService');

module.exports = {
  AUTH_URI:
    process.env.NODE_ENV === 'production'
      ? '/auth/'
      : window.location.host === 'edge-ml.ngrok.io'
      ? 'http://auth.edge-ml.ngrok.io/auth/'
      : 'http://localhost:3002/auth/',
  API_URI:
    process.env.NODE_ENV === 'production'
      ? '/api/'
      : window.location.host === 'edge-ml.ngrok.io'
      ? 'http://backend.edge-ml.ngrok.io/api/'
      : 'http://localhost:3001/api/',
  ML_URI:
    process.env.NODE_ENV === 'production'
      ? '/ml/'
      : window.location.host === 'edge-ml.ngrok.io'
      ? 'http://ml.edge-ml.ngrok.io/ml/'
      : 'http://localhost:3003/ml/',

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
    DATASETS_CAN_EDIT: 'datasets/canedit',
    DEVICE: 'devices',
    LABEL_DEFINITIONS: 'labelDefinitions',
    DATASET_LABEL_DEFINITIONS: 'datasetLabelDefinitions',
    LABEL_TYPES: 'labelTypes',
    EXPERIMENTS: 'experiments',
    PROJECTS: 'projects',
    SETDEVICEAPIKEY: 'deviceApi/setkey',
    GETDEVICEAPIKEY: 'deviceApi/getkey',
    REMOVEDEVICEAPIKEY: 'deviceApi/deletekey',
    SWTICHDEVICEAPIACTIVE: 'deviceApi/switchActive'
  },
  ML_ENDPOINTS: {
    MODELS: 'models',
    TRAIN: 'train',
    TRAIN_ONGOING: 'train/ongoing',
    TRAINED_MODELS: 'models/trained',
    DEPLOY: 'deploy',
    PARAMETERS: 'parameters'
  }
};

module.exports.generateApiRequest = (
  method = this.HTTP_METHODS.GET,
  baseUri = this.API_URI,
  endpoint = this.API_ENDPOINTS.DEFAULT,
  body = {},
  params = {}
) => {
  const project = localStorageService.getProject();
  return {
    method: method,
    url: baseUri + endpoint,
    data: body,
    params: params,
    headers: {
      'Content-Type': 'application/json',
      ...(project && { project: project }),
      Authorization: localStorageService.getAccessToken()
    }
  };
};
