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

module.exports.deleteUser = function(userEMail) {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.AUTH_URI,
        apiConsts.API_ENDPOINTS.DELETE,
        {
          email: userEMail
        }
      )
    )
      .then(data => resolve(data.data))
      .catch(data => reject(data));
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
