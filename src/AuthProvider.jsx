import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { setToken, clearToken } from './services/LocalStorageService';
import { loginUser } from './services/ApiServices/AuthentificationServices';
import {
  getAccessToken,
  getRefreshToken,
} from './services/LocalStorageService';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUserInternal] = useState();

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const setUser = (mail, name, id) => {
    setUserInternal({ mail: mail, name: name, _id: id });
  };

  const logout = () => {
    clearToken();
    setUserInternal(undefined);
  };

  const login = async (email, password) => {
    const userData = await loginUser(email, password);
    const decoded = jwtDecode(userData.access_token);
    setToken(userData.access_token, userData.refresh_token);
    setUser(decoded.email, decoded.userName, decoded.id);
  };

  const checkLoginStatus = () => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    if (accessToken) {
      const decoded = jwt_decode(accessToken);
      if (decoded.exp * 1000 >= Date.now()) {
        setUser(decoded.email, decoded.userName, decoded.id);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
