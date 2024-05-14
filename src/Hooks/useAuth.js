import { create } from 'zustand';
import { useEffect } from 'react';
import jwt_decode from 'jwt-decode';
import {
  setToken,
  clearToken,
  getAccessToken,
  getRefreshToken,
} from '../services/LocalStorageService';
import { loginUser } from '../services/ApiServices/AuthentificationServices';
import useUserStore from './useUser';

const useAuth = () => {
  const user = useUserStore;

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const logout = () => {
    clearToken();
    set({ user: undefined });
  };

  const login = async (email, password) => {
    const userData = await loginUser(email, password);
    const decoded = jwt_decode(userData.access_token);
    setToken(userData.access_token, userData.refresh_token);
    set({
      user: { mail: decoded.email, name: decoded.userName, _id: decoded.id },
    });
  };

  const checkLoginStatus = () => {
    const accessToken = getAccessToken();
    if (accessToken) {
      const decoded = jwt_decode(accessToken);
      if (decoded.exp * 1000 >= Date.now()) {
        set({
          user: {
            mail: decoded.email,
            name: decoded.userName,
            _id: decoded.id,
          },
        });
      }
    }
  };

  return {
    login: login,
    logout: logout,
  };
};

export default useAuth;
