import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4040";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Check both localStorage and sessionStorage for the token
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Dispatch a custom event to notify AuthContext about token expiration / invalidation
      window.dispatchEvent(new CustomEvent("auth-unauthorized"));
    }
    return Promise.reject(error);
  }
);

export default api;