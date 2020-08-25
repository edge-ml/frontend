var apiConsts = require('./ApiConstants');

const axios = require('axios');

module.exports.loginUser = function(userEMail, password) {
  return new Promise((resolve, reject) => {
    axios(
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
      .catch(data => reject(data));
  });
};

module.exports.deleteUser = userEMail => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.DELETE,
        {
          email: userEMail
        }
      )
    )
      .then(data => resolve(data.data))
      .catch(error => reject(error));
  });
};

module.exports.registerNewUser = function(userEMail, password) {
  return new Promise((resolve, reject) => {
    axios(
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
      .catch(data => reject(data));
  });
};

module.exports.subscribeUsers = (accessToken, callback) => {
  axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.GET,
      apiConsts.AUTH_URI,
      apiConsts.AUTH_ENDPOINTS.USERS,
      accessToken
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
      apiConsts.AUTH_ENDPOINTS.INIT2FA,
      accessToken
    )
  )
    .then(res => callback(res.data))
    .catch(err => callback(err));
};

module.exports.verify2FA = (accessToken, token, callback) => {
  axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.POST,
      apiConsts.AUTH_URI,
      apiConsts.AUTH_ENDPOINTS.VERIFY2FA,
      accessToken,
      { token: token }
    )
  )
    .then(res => callback(res.data))
    .catch(err => callback(err.response));
};

module.exports.reset2FA = (accessToken, callback) => {
  axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.POST,
      apiConsts.AUTH_URI,
      apiConsts.AUTH_ENDPOINTS.RESET2FA,
      accessToken
    )
  )
    .then(res => callback(res.data))
    .catch(err => callback(err));
};
