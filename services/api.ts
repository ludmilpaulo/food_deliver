"use client";
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { baseAPI as backend } from "./types";
import { getLanguage } from "@/configs/i18n";
import { clearAuthToken, readAuthToken, refreshAccessToken } from "@/lib/authToken";

export const baseAPI = backend;

export const AUTH_EXPIRED_EVENT = "kudya:auth-expired";

/** Endpoints that also work anonymously; a dead session falls back to an unauthenticated retry. */
const PUBLIC_PATH_PREFIXES = [
  "/api/v1/food/stores",
  "/api/v1/food/products",
  "/api/v1/food/categories",
  "/api/v1/food/cuisines",
  "/store/",
  "/customer/products/",
  "/customer/customer/stores/",
  "/api/translations/",
  "/api/platform/",
];

type RetriableConfig = InternalAxiosRequestConfig & {
  _retriedWithRefresh?: boolean;
  _retriedWithoutAuth?: boolean;
};

export function isPublicApiPath(url: string | undefined): boolean {
  if (!url) return false;
  let path = url;
  try {
    path = new URL(url, "http://local").pathname;
  } catch {
    // keep raw url
  }
  return PUBLIC_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
}

export type AuthExpiredDetail = { requiresLogin: boolean };

function notifyAuthExpired(requiresLogin: boolean): void {
  clearAuthToken();
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<AuthExpiredDetail>(AUTH_EXPIRED_EVENT, { detail: { requiresLogin } }),
    );
  }
}

const api = axios.create({
  baseURL: baseAPI,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  config.headers["Accept-Language"] = getLanguage();
  const retry = config as RetriableConfig;
  const token = readAuthToken();
  if (token && !retry._retriedWithoutAuth && !retry._retriedWithRefresh) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// On 401 with a token: refresh once and retry. If refresh is impossible the
// session is dead — clear it and notify the app (ClientRoot logs out). Public
// catalog endpoints are retried anonymously so browsing keeps working.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error?.response?.status;
    const config = error?.config as RetriableConfig | undefined;
    const sentAuth = Boolean(config?.headers?.Authorization);
    if (status !== 401 || !config || !sentAuth || config._retriedWithoutAuth) {
      return Promise.reject(error);
    }

    if (!config._retriedWithRefresh) {
      config._retriedWithRefresh = true;
      const access = await refreshAccessToken();
      if (access) {
        config.headers["Authorization"] = `Bearer ${access}`;
        return api.request(config);
      }
    }

    const isPublic = isPublicApiPath(config.url);
    notifyAuthExpired(!isPublic);
    if (isPublic) {
      config._retriedWithoutAuth = true;
      delete config.headers.Authorization;
      return api.request(config);
    }
    return Promise.reject(error);
  }
);

export default api;

// Use this `api` instance to make all backend calls
