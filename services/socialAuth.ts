import { baseAPI } from "./types";
import type { LoginResult } from "@/redux/slices/authSlice";

export type SocialProvider = "google" | "facebook" | "tiktok";

const GOOGLE_WEB = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";
const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? "";
const TIKTOK_CLIENT_KEY = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY ?? "";

const TIKTOK_STATE_KEY = "kudya_oauth_state";
const TIKTOK_PROVIDER_KEY = "kudya_oauth_provider";
const TIKTOK_NEXT_KEY = "kudya_oauth_next";

export type SocialPublicConfig = {
  google_web_client_id: string;
  facebook_app_id: string;
  tiktok_client_key: string;
};

const emptyConfig = (): SocialPublicConfig => ({
  google_web_client_id: GOOGLE_WEB,
  facebook_app_id: FACEBOOK_APP_ID,
  tiktok_client_key: TIKTOK_CLIENT_KEY,
});

let cachedPublicConfig: SocialPublicConfig | null = null;

export async function getSocialPublicConfig(): Promise<SocialPublicConfig> {
  if (cachedPublicConfig) return cachedPublicConfig;
  const fallback = emptyConfig();
  try {
    const response = await fetch(`${baseAPI}/api/auth/social/config/`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      cachedPublicConfig = fallback;
      return fallback;
    }
    const data = (await response.json()) as Partial<SocialPublicConfig>;
    cachedPublicConfig = {
      google_web_client_id: fallback.google_web_client_id || String(data.google_web_client_id || ""),
      facebook_app_id: fallback.facebook_app_id || String(data.facebook_app_id || ""),
      tiktok_client_key: fallback.tiktok_client_key || String(data.tiktok_client_key || ""),
    };
    return cachedPublicConfig;
  } catch {
    cachedPublicConfig = fallback;
    return fallback;
  }
}

export function oauthRedirectUri(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin.replace(/\/$/, "")}/oauth`;
  }
  const base = (process.env.NEXT_PUBLIC_APP_URL || "https://sd-kudya.vercel.app").replace(
    /\/$/,
    "",
  );
  return `${base}/oauth`;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function randomOAuthString(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

export type SocialTokenPayload = {
  access_token?: string;
  id_token?: string;
  code?: string;
  redirect_uri?: string;
  code_verifier?: string;
};

export async function exchangeSocialToken(
  provider: SocialProvider,
  tokens: SocialTokenPayload,
): Promise<LoginResult> {
  let response: Response;
  try {
    response = await fetch(`${baseAPI}/api/auth/social/`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        access_token: tokens.access_token ?? "",
        id_token: tokens.id_token ?? "",
        code: tokens.code ?? "",
        redirect_uri: tokens.redirect_uri ?? "",
        code_verifier: tokens.code_verifier ?? "",
      }),
    });
  } catch {
    throw new Error("network");
  }

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(String(data.detail || data.message || "failed"));
  }
  const token = String(data.token || data.access || "");
  if (!token) {
    throw new Error("failed");
  }
  return {
    token,
    access: String(data.access || token),
    refresh: data.refresh ? String(data.refresh) : undefined,
    user_id: Number(data.user_id),
    username: String(data.username || ""),
    role: data.role ? String(data.role) : undefined,
    is_platform_admin: Boolean(data.is_platform_admin),
    is_customer: Boolean(data.is_customer),
    is_driver: Boolean(data.is_driver),
    message: String(data.message || ""),
    created: Boolean(data.created),
    needs_profile: Boolean(data.needs_profile),
    business_profile: data.business_profile as LoginResult["business_profile"],
  };
}

export function isSocialLoginConfigured(
  provider: SocialProvider,
  config?: SocialPublicConfig | null,
): boolean {
  const resolved = config ?? cachedPublicConfig ?? emptyConfig();
  switch (provider) {
    case "google":
      return Boolean(resolved.google_web_client_id);
    case "facebook":
      return Boolean(resolved.facebook_app_id);
    case "tiktok":
      return Boolean(resolved.tiktok_client_key);
    default:
      return false;
  }
}

function loadScript(src: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("failed"));
      return;
    }
    const existing = document.getElementById(id);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("failed"));
    document.head.appendChild(script);
  });
}

type GoogleTokenClient = {
  requestAccessToken: (opts?: { prompt?: string }) => void;
};

type GoogleGis = {
  accounts: {
    oauth2: {
      initTokenClient: (config: {
        client_id: string;
        scope: string;
        callback: (response: { access_token?: string; error?: string }) => void;
      }) => GoogleTokenClient;
    };
  };
};

type FacebookLoginResponse = {
  authResponse?: { accessToken: string };
  status?: string;
};

type FacebookSdk = {
  init: (config: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
  login: (
    callback: (response: FacebookLoginResponse) => void,
    options: { scope: string },
  ) => void;
};

declare global {
  interface Window {
    google?: GoogleGis;
    FB?: FacebookSdk;
    fbAsyncInit?: () => void;
  }
}

export async function signInWithGoogleWeb(): Promise<LoginResult> {
  const config = await getSocialPublicConfig();
  const clientId = config.google_web_client_id;
  if (!clientId) {
    throw new Error("not_configured");
  }
  await loadScript("https://accounts.google.com/gsi/client", "kudya-google-gis");
  const gis = window.google;
  if (!gis?.accounts?.oauth2) {
    throw new Error("failed");
  }
  return new Promise((resolve, reject) => {
    const client = gis.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error("cancelled"));
          return;
        }
        exchangeSocialToken("google", { access_token: response.access_token })
          .then(resolve)
          .catch(reject);
      },
    });
    client.requestAccessToken({ prompt: "select_account" });
  });
}

async function loadFacebookSdk(appId: string): Promise<FacebookSdk> {
  if (window.FB) {
    return window.FB;
  }
  await new Promise<void>((resolve, reject) => {
    window.fbAsyncInit = () => {
      window.FB?.init({
        appId,
        cookie: false,
        xfbml: false,
        version: "v21.0",
      });
      resolve();
    };
    loadScript("https://connect.facebook.net/en_US/sdk.js", "kudya-facebook-sdk").catch(reject);
  });
  if (!window.FB) {
    throw new Error("failed");
  }
  return window.FB;
}

export async function signInWithFacebookWeb(): Promise<LoginResult> {
  const config = await getSocialPublicConfig();
  if (!config.facebook_app_id) {
    throw new Error("not_configured");
  }
  // The SDK refuses FB.login on http pages and never invokes the callback.
  if (window.location.protocol !== "https:") {
    throw new Error("Facebook sign-in requires HTTPS.");
  }
  const fb = await loadFacebookSdk(config.facebook_app_id);
  return new Promise((resolve, reject) => {
    fb.login(
      (response) => {
        if (!response.authResponse?.accessToken) {
          reject(new Error("cancelled"));
          return;
        }
        exchangeSocialToken("facebook", {
          access_token: response.authResponse.accessToken,
        })
          .then(resolve)
          .catch(reject);
      },
      { scope: "public_profile,email" },
    );
  });
}

export async function startTikTokWebLogin(nextPath?: string | null): Promise<void> {
  const config = await getSocialPublicConfig();
  if (!config.tiktok_client_key) {
    throw new Error("not_configured");
  }
  // TikTok web Login Kit uses state + the server-held secret; it has no standard PKCE.
  const state = randomOAuthString(16);
  sessionStorage.setItem(TIKTOK_STATE_KEY, state);
  sessionStorage.setItem(TIKTOK_PROVIDER_KEY, "tiktok");
  if (nextPath) {
    sessionStorage.setItem(TIKTOK_NEXT_KEY, nextPath);
  }
  const params = new URLSearchParams({
    client_key: config.tiktok_client_key,
    redirect_uri: oauthRedirectUri(),
    response_type: "code",
    scope: "user.info.basic",
    state,
  });
  window.location.assign(`https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`);
}

export function consumeOauthNextPath(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  const next = sessionStorage.getItem(TIKTOK_NEXT_KEY);
  sessionStorage.removeItem(TIKTOK_NEXT_KEY);
  return next;
}

export async function completeTikTokWebCallback(params: {
  code?: string | null;
  state?: string | null;
  error?: string | null;
}): Promise<LoginResult> {
  if (params.error === "access_denied") {
    throw new Error("cancelled");
  }
  const expectedState = sessionStorage.getItem(TIKTOK_STATE_KEY);
  sessionStorage.removeItem(TIKTOK_STATE_KEY);
  sessionStorage.removeItem(TIKTOK_PROVIDER_KEY);
  if (!params.code) {
    throw new Error("cancelled");
  }
  if (!expectedState || params.state !== expectedState) {
    throw new Error("failed");
  }
  return exchangeSocialToken("tiktok", {
    code: params.code,
    redirect_uri: oauthRedirectUri(),
  });
}
