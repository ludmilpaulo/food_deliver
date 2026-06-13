"use client";
import axios from "axios";
import { baseAPI as backend } from "./types";

export const baseAPI = backend;




const api = axios.create({
  baseURL: baseAPI,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const language = localStorage.getItem("language") || "en"; // Default to English
  config.headers["Accept-Language"] = language;
  try {
    const token = JSON.parse(localStorage.getItem("auth_token") || "null");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

// When the stored token is invalid/expired the backend returns 401 even for
// public endpoints. Clear the stale session and retry the request once
// without the Authorization header so public pages keep working.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const code = error?.response?.data?.code;
    const config = error?.config;
    if (status === 401 && code === "token_not_valid" && config && !config._retriedWithoutAuth) {
      try {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      } catch {}
      config._retriedWithoutAuth = true;
      delete config.headers?.Authorization;
      return api.request(config);
    }
    return Promise.reject(error);
  }
);

export default api;

// Use this `api` instance to make all backend calls
