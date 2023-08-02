import apiConsts from './ApiConstants';
import ax from 'axios';

const axios = ax.create();
const axiosNoToken = ax.create();

export const loginUser = function (userEMail, password) {
  return new Promise((resolve, reject) => {
    axiosNoToken(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.LOGIN,
        {
          email: userEMail,
          password: password,
        }
      )
    )
      .then((data) => resolve(data.data))
      .catch((err) => reject(err.response));
  });
};

export const loginUserRefresh = (refreshToken) => {
  return new Promise((resolve, reject) => {
    axiosNoToken(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.REFRESH,
        {
          refresh_token: refreshToken,
        }
      )
    )
      .then((data) => resolve(data.data))
      .catch((err) => reject(err.response));
  });
};

export const deleteUser = (userEMail) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.DELETE,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.DELETE,
        {
          email: userEMail,
        }
      )
    )
      .then((data) => resolve(data.data))
      .catch((err) => reject(err.response));
  });
};

export const registerNewUser = function (userEMail, password, userName) {
  return new Promise((resolve, reject) => {
    axiosNoToken(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.REGISTER,
        {
          email: userEMail,
          password: password,
          userName: userName,
        }
      )
    )
      .then((data) => resolve(data.data))
      .catch((err) => reject(err.response.data.error));
  });
};

export const subscribeUsers = (callback) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.USERS
      )
    )
      .then((res) => callback(res.data))
      .catch(() => callback([]));
  });
};

export const init2FA = () => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.INIT2FA
      )
    )
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response));
  });
};

export const verify2FA = (token) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.VERIFY2FA,
        { token: token }
      )
    )
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response));
  });
};

export const reset2FA = () => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.RESET2FA
      )
    )
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response));
  });
};

export const getUserMail = (userIDs) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.MAIL,
        userIDs
      )
    )
      .then((res) => {
        resolve(res.data[0]);
      })
      .catch((err) => {
        reject(err.response);
      });
  });
};

export const changeUserMail = (newUserMail) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.PUT,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.CHANGE_MAIL,
        { email: newUserMail }
      )
    )
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response.data));
  });
};

export const changeUserName = (newUserName) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.PUT,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.CHANGE_USERNAME,
        { userName: newUserName }
      )
    )
      .then((data) => {
        resolve(data.data);
      })
      .catch((err) => {
        reject(err.response.data);
      });
  });
};

export const changeUserPassword = (currentPassword, newPassword) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.PUT,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.CHANGE_PASSWORD,
        { password: currentPassword, newPassword: newPassword }
      )
    )
      .then((res) => resolve(res.data))
      .catch((err) => reject(err.response.data));
  });
};

export const getUserIds = (userNames) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.ID,
        userNames
      )
    )
      .then((data) => {
        resolve(data.data);
      })
      .catch((err) => reject(err.response));
  });
};

export const getUserNameSuggestions = (userName) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.USERNAMESUGGEST,
        { userName: userName }
      )
    )
      .then((data) => resolve(data.data))
      .catch((err) => reject(err.response.data.error));
  });
};
