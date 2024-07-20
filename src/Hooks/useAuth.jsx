import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import {
  setToken,
  clearToken,
  getAccessToken,
} from "../services/LocalStorageService";
import {
  loginUser,
  loginOAuth as loingOAuth_api,
  getUser as getUser_api,
  logout as logout_api
} from "../services/ApiServices/AuthentificationServices";
import useUserStore from "./useUser";
import { getCookie } from "../utils";

const useAuth = () => {
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const logout = () => {
    logout_api();
    setUser(undefined);
  };

  const login = async (email, password) => {
    const success = await loginUser(email, password);
    const user = await getUser_api();
    setUser(user);

  };

  const loginOAuth = async (provider) => {
    const res = await loingOAuth_api(provider);
    return res;
  };

  const checkLoginStatus = async () => {
    const user = await getUser_api();
    setUser(user);
  }


  // const checkLoginStatus = () => {
  //   const accessToken = getAccessToken() || getCookie("jwt");
  //   console.log(accessToken)
  //   if (accessToken) {
  //     const decoded = jwtDecode(accessToken);
  //     console.log(decoded)
  //     console.log(decoded.exp * 1000, Date.now)
  //     if (decoded.exp * 1000 >= Date.now()) {
  //       setUser({
  //         mail: decoded.email,
  //         name: decoded.userName,
  //         _id: decoded.id,
  //       });
  //     } else {
  //       console.log(decoded)
  //       console.log("Token expired");
  //     }
  //   }
  // };

  return {
    login: login,
    logout: logout,
    loginOAuth: loginOAuth
  };
};

export default useAuth;
