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
  return config;
});

export default api;

// Use this `api` instance to make all backend calls