import { createContext, useState } from 'react';
import jwt_decode from 'jwt-decode';
import { setToken, clearToken } from './services/LocalStorageService';
import { loginUser } from './services/ApiServices/AuthentificationServices';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUserInternal] = useState();

  const setUser = (mail, name, id) => {
    setUserInternal({ mail: mail, name: name, _id: id });
  };

  const logout = () => {
    clearToken();
    setUserInternal(undefined);
  };

  const login = async (email, password) => {
    const userData = await loginUser(email, password);
    const decoded = jwt_decode(userData.access_token);
    setToken(userData.access_token, userData.refresh_token);
    console.log(decoded.id);
    setUser(decoded.email, decoded.userName, decoded.id);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
