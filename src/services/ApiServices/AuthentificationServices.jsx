import apiConsts from "./ApiConstants";
import ax from "axios";
import apiRequest from "./request";

const axios = ax.create();
const axiosNoToken = ax.create();

export const loginUser = async (userMail, password) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.POST,
    apiConsts.AUTH_URI,
    apiConsts.AUTH_ENDPOINTS.LOGIN,
    {
      email: userMail,
      password: password,
    }
  );
  return res;
};

export const getUserNames = async (userIds) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.POST,
    apiConsts.AUTH_URI,
    apiConsts.AUTH_ENDPOINTS.USERNAME,
    userIds
  );
  return res;
};



export const logout = async () => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.AUTH_URI,
    apiConsts.AUTH_ENDPOINTS.LOGOUT
  )
  return res;
}

export const getUser = async () => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.AUTH_URI,
    apiConsts.AUTH_ENDPOINTS.USER
  );
  return res;
};

export const loginOAuth = async (provider) => {
  // const res = await apiRequest(
  //   apiConsts.HTTP_METHODS.GET,
  //   apiConsts.AUTH_URI,
  //   apiConsts.AUTH_ENDPOINTS.OAUTH,
  //   { provider: provider }
  // );
  // return res;

  const url = apiConsts.AUTH_URI + apiConsts.AUTH_ENDPOINTS.OAUTH + "?provider=" + provider
  console.log(url)
  window.open(url, "_self");

};

export const loginUserRefresh = async (refreshToken) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.POST,
    apiConsts.AUTH_URI,
    apiConsts.AUTH_ENDPOINTS.REFRESH,
    {
      refresh_token: refreshToken,
    }
  );
  return res;
};

export const deleteUser = async (userEMail) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.DELETE,
    apiConsts.AUTH_URI,
    apiConsts.AUTH_ENDPOINTS.DELETE,
    {
      email: userEMail,
    }
  );
  return res;
};

export const registerNewUser = async (userEMail, password, userName) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.POST,
    apiConsts.AUTH_URI,
    apiConsts.AUTH_ENDPOINTS.REGISTER,
    {
      email: userEMail,
      password: password,
      userName: userName,
    }
  );
};

export const subscribeUsers = async (callback) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.AUTH_URI,
    apiConsts.AUTH_ENDPOINTS.USERS
  );
  callback(res);
};

export const getUserMail = async () => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.AUTH_URI,
    apiConsts.AUTH_ENDPOINTS.MAIL
  );
  return res;
};

export const changeUserMail = async (newUserMail) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.PUT,
    apiConsts.AUTH_URI,
    apiConsts.AUTH_ENDPOINTS.CHANGE_MAIL,
    { email: newUserMail }
  );
  return res;
};

export const changeUserName = async (newUserName) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.PUT,
    apiConsts.AUTH_URI,
    apiConsts.AUTH_ENDPOINTS.CHANGE_USERNAME,
    { userName: newUserName }
  );
  return res;
};

export const changeUserPassword = async (currentPassword, newPassword) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.PUT,
    apiConsts.AUTH_URI,
    apiConsts.AUTH_ENDPOINTS.CHANGE_PASSWORD,
    { password: currentPassword, newPassword: newPassword }
  );
  return res;
};

export const getUserIds = async (userNames) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.POST,
    apiConsts.AUTH_URI,
    apiConsts.AUTH_ENDPOINTS.ID,
    userNames
  );
  return res;
};

export const getUserNameSuggestions = async (userName) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.POST,
    apiConsts.AUTH_URI,
    apiConsts.AUTH_ENDPOINTS.USERNAMESUGGEST,
    { userName: userName }
  );
  return res;
};
