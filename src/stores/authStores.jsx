import create from "zustand";
import { jwtDecode } from "jwt-decode";
import { setToken, clearToken } from "./services/LocalStorageService";
import { loginUser } from "./services/ApiServices/AuthentificationServices";
import {
  getAccessToken,
  getRefreshToken,
} from "./services/LocalStorageService";

const useAuthStore = create((set) => ({
  user: undefined,

  setUser: (email, name, id) => set({ user: { email, name, _id: id } }),

  logout: () => {
    clearToken();
    set({ user: undefined });
  },

  login: async (email, password) => {
    const userData = await loginUser(email, password);
    const decoded = jwtDecode(userData.access_token);
    setToken(userData.access_token, userData.refresh_token);
    set({
      user: { email: decoded.email, name: decoded.userName, _id: decoded.id },
    });
  },

  checkLoginStatus: () => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    if (accessToken) {
      const decoded = jwtDecode(accessToken);
      if (decoded.exp * 1000 >= Date.now()) {
        set({
          user: {
            email: decoded.email,
            name: decoded.userName,
            _id: decoded.id,
          },
        });
      }
    }
  },
}));

// Use this to initialize the login status on app start
const initializeAuth = () => {
  const { checkLoginStatus } = useAuthStore.getState();
  checkLoginStatus();
};

export { useAuthStore, initializeAuth };
