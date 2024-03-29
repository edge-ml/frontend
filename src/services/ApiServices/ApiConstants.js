import localStorageService from './../LocalStorageService';

const currentHost = window.location.host.split(':')[0];

export const AUTH_URI =
  process.env.NODE_ENV === 'production'
    ? '/auth/'
    : window.location.host === 'edge-ml.ngrok.io'
    ? 'http://auth.edge-ml.ngrok.io/auth/'
    : `http://${currentHost}:3002/auth/`;

export const API_URI =
  process.env.NODE_ENV === 'production'
    ? '/api/'
    : window.location.host === 'edge-ml.ngrok.io'
    ? 'http://backend.edge-ml.ngrok.io/api/'
    : `http://${currentHost}:3001/api/`;
export const ML_URI =
  process.env.NODE_ENV === 'production'
    ? '/ml/'
    : window.location.host === 'edge-ml.ngrok.io'
    ? 'http://ml.edge-ml.ngrok.io/ml/'
    : `http://${currentHost}:3003/ml/`;

export const DATASET_STORE =
  process.env.NODE_ENV === 'production'
    ? '/ds/'
    : window.location.host === 'edge-ml.ngrok.io'
    ? 'http://ds.edge-ml.ngrok.io/ds/'
    : `http://${currentHost}:3004/ds/`;

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
};

export const AUTH_ENDPOINTS = {
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
  USERNAME: 'userName',
};

export const API_ENDPOINTS = {
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
  SWTICHDEVICEAPIACTIVE: 'deviceApi/switchActive',
  ARDUINOFIRMWARE: 'arduinoFirmware',
  PROCESS_CSV: 'CSVServices/processCSV',
  GENERATE_DATASET: 'CSVServices/generateDataset',
};

export const ML_ENDPOINTS = {
  MODELS: 'models',
  TRAIN: 'train/',
  TRAIN_ONGOING: 'train/ongoing',
  TRAINED_MODELS: 'models/trained',
  DEPLOY: 'deploy',
  PARAMETERS: 'parameters',
};

export const DATASET_STORE_ENDPOINTS = {
  DATASETS: 'datasets/',
  DATASET_LABELINGS: 'datasets/labelings/',
  LABELING: 'labelings/',
  CSV: 'download/',
  CREATE_DATASET: 'datasets/create',
};

export const generateApiRequest = (
  method = this.HTTP_METHODS.GET,
  baseUri = this.API_URI,
  endpoint = this.API_ENDPOINTS.DEFAULT,
  body = {},
  params = {},
  contentType = 'application/json'
) => {
  const project = localStorageService.getProject();
  return {
    method: method,
    url: baseUri + endpoint,
    data: body,
    params: params,
    headers: {
      'Content-Type': contentType,
      ...(project && { project: project }),
      Authorization: localStorageService.getAccessToken(),
    },
  };
};

const expObj = {
  AUTH_URI,
  API_URI,
  ML_URI,
  DATASET_STORE,
  HTTP_METHODS,
  AUTH_ENDPOINTS,
  API_ENDPOINTS,
  ML_ENDPOINTS,
  DATASET_STORE_ENDPOINTS,
  generateApiRequest,
};

export default expObj;
