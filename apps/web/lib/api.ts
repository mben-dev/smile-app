import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Clear the token and redirect to login
      Cookies.remove("auth_token");

      // If we're in the browser, redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
