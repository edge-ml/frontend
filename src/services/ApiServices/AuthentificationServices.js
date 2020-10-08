var apiConsts = require('./ApiConstants');
const ax = require('axios');
const { default: LocalStorageService } = require('../LocalStorageService');
const axios = ax.create();
const axiosNoToken = ax.create();
const localStorageService = LocalStorageService.getService();

axios.interceptors.request.use(config => {
  const token = localStorageService.getAccessToken();
  if (token) {
    config.headers['Authorization'] = token;
  }
  return config;
});

module.exports.loginUser = function(userEMail, password) {
  return new Promise((resolve, reject) => {
    axiosNoToken(
      apiConsts.generateRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.LOGIN,
        {
          email: userEMail,
          password: password
        }
      )
    )
      .then(data => resolve(data.data))
      .catch(err => reject(err));
  });
};

module.exports.deleteUser = (accesstoken, userEMail) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.DELETE,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.DELETE,
        {
          email: userEMail
        }
      )
    )
      .then(data => resolve(data.data))
      .catch(err => reject(err));
  });
};

module.exports.registerNewUser = function(userEMail, password) {
  return new Promise((resolve, reject) => {
    axiosNoToken(
      apiConsts.generateRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.AUTH_URI,
        apiConsts.API_ENDPOINTS.REGISTER,
        {
          email: userEMail,
          password: password
        }
      )
    )
      .then(data => resolve(data.data))
      .catch(err => reject(err));
  });
};

module.exports.subscribeUsers = (accessToken, callback) => {
  axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.GET,
      apiConsts.AUTH_URI,
      apiConsts.AUTH_ENDPOINTS.USERS
    )
  )
    .then(res => callback(res.data))
    .catch(() => callback([]));
};

module.exports.init2FA = (accessToken, callback) => {
  console.log('init 2FA');
  axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.POST,
      apiConsts.AUTH_URI,
      apiConsts.AUTH_ENDPOINTS.INIT2FA
    )
  )
    .then(res => callback(res.data))
    .catch(err => callback(err));
};

module.exports.verify2FA = (accessToken, token) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.VERIFY2FA,
        { token: token }
      )
    )
      .then(res => resolve(res.data))
      .catch(err => reject(err.response));
  });
};

module.exports.reset2FA = (accessToken, callback) => {
  axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.POST,
      apiConsts.AUTH_URI,
      apiConsts.AUTH_ENDPOINTS.RESET2FA
    )
  )
    .then(res => callback(res.data))
    .catch(err => callback(err));
};
