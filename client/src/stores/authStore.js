import { create } from "zustand";
import api from "../api/axios";

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAccessToken: (token) => set({ accessToken: token }),

  // Register
  register: async ({ name, email, password }) => {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
    });
    set({
      user: data.data.user,
      accessToken: data.data.accessToken,
      isAuthenticated: true,
    });
    return data;
  },

  // Login
  login: async ({ email, password }) => {
    const { data } = await api.post("/auth/login", { email, password });
    set({
      user: data.data.user,
      accessToken: data.data.accessToken,
      isAuthenticated: true,
    });
    return data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore errors — clear local state anyway
    }
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  // Check auth on app load (try refresh)
  checkAuth: async () => {
    try {
      const { data } = await api.post("/auth/refresh");
      const token = data.data.accessToken;

      // Fetch user profile with new token
      const { data: meData } = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({
        user: meData.data.user,
        accessToken: token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));

export default useAuthStore;
