import { getRefreshToken, setToken } from './LocalStorageService';
import { loginUserRefresh } from './ApiServices/AuthentificationServices';
import jwt_decode from 'jwt-decode';

export const renewAccessToken = (onUserLoggedIn) => {
  const refreshToken = getRefreshToken();
  console.log('starting renewal');

  loginUserRefresh(refreshToken)
    .then((res) => {
      const refreshedAccessToken = 'Bearer ' + res.access_token;
      const decoded = jwt_decode(refreshedAccessToken);
      setToken(refreshedAccessToken, refreshToken);
      onUserLoggedIn(
        refreshedAccessToken,
        refreshToken,
        decoded.email,
        decoded.twoFactorEnabled,
        decoded.userName,
        decoded.subscriptionLevel
      );
      console.log('success');
    })
    .catch((err) => {
      console.log(err);
    });
};
