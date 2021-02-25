const getAccessToken = require('../LocalStorageService').getAccessToken;
var apiConsts = require('./ApiConstants');
const ax = require('axios');
const axios = ax.create();
const axiosNoToken = ax.create();

module.exports.loginUser = function(userEMail, password) {
  return new Promise((resolve, reject) => {
    axiosNoToken(
      apiConsts.generateApiRequest(
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
      .catch(err => reject(err.response));
  });
};

module.exports.deleteUser = userEMail => {
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
      .catch(err => reject(err.response));
  });
};

module.exports.registerNewUser = function(userEMail, password, userName) {
  return new Promise((resolve, reject) => {
    axiosNoToken(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.REGISTER,
        {
          email: userEMail,
          password: password,
          userName: userName
        }
      )
    )
      .then(data => resolve(data.data))
      .catch(err => reject(err.response.data.error));
  });
};

module.exports.subscribeUsers = callback => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.USERS
      )
    )
      .then(res => callback(res.data))
      .catch(() => callback([]));
  });
};

module.exports.init2FA = () => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.INIT2FA
      )
    )
      .then(res => resolve(res.data))
      .catch(err => reject(err.response));
  });
};

module.exports.verify2FA = token => {
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

module.exports.reset2FA = () => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.RESET2FA
      )
    )
      .then(res => resolve(res.data))
      .catch(err => reject(err.response));
  });
};

module.exports.getUserMail = userIDs => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.MAIL,
        userIDs
      )
    )
      .then(res => {
        resolve(res.data[0]);
      })
      .catch(err => {
        reject(err.response);
      });
  });
};

module.exports.changeUserMail = newUserMail => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.PUT,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.CHANGE_MAIL,
        { email: newUserMail }
      )
    )
      .then(res => resolve(res.data))
      .catch(err => reject(err.response.data));
  });
};

module.exports.changeUserName = newUserName => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.PUT,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.CHANGE_USERNAME,
        { userName: newUserName }
      )
    )
      .then(data => {
        resolve(data.data);
      })
      .catch(err => {
        reject(err.response.data);
      });
  });
};

module.exports.changeUserPassword = (currentPassword, newPassword) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.PUT,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.CHANGE_PASSWORD,
        { password: currentPassword, newPassword: newPassword }
      )
    )
      .then(res => resolve(res.data))
      .catch(err => reject(err.response.data));
  });
};

module.exports.getUserIds = userMails => {
  return new Promise((resolve, reject) => {
    const promises = userMails.map(elm => {
      return axios(
        apiConsts.generateApiRequest(
          apiConsts.HTTP_METHODS.POST,
          apiConsts.AUTH_URI,
          apiConsts.AUTH_ENDPOINTS.ID,
          { email: elm }
        )
      );
    });
    Promise.all(promises)
      .then(data => {
        resolve(data.map(elm => elm.data));
      })
      .catch(err => reject(err.response));
  });
};

module.exports.getMailSuggestions = userMail => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.MAILSUGGEST,
        { email: userMail }
      )
    )
      .then(data => resolve(data.data))
      .catch(err => reject(err.response.data.error));
  });
};
