import { baseAPI } from "./types";
import type { LoginResult } from "@/redux/slices/authSlice";

export type SocialProvider = "google" | "facebook" | "tiktok";

const GOOGLE_WEB = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";
const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? "";
const TIKTOK_CLIENT_KEY = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY ?? "";

const TIKTOK_STATE_KEY = "kudya_oauth_state";
const TIKTOK_VERIFIER_KEY = "kudya_oauth_verifier";
const TIKTOK_PROVIDER_KEY = "kudya_oauth_provider";

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

export async function pkceChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toBase64Url(new Uint8Array(digest));
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

export function isSocialLoginConfigured(provider: SocialProvider): boolean {
  switch (provider) {
    case "google":
      return Boolean(GOOGLE_WEB);
    case "facebook":
      return Boolean(FACEBOOK_APP_ID);
    case "tiktok":
      return Boolean(TIKTOK_CLIENT_KEY);
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
  if (!GOOGLE_WEB) {
    throw new Error("not_configured");
  }
  await loadScript("https://accounts.google.com/gsi/client", "kudya-google-gis");
  const gis = window.google;
  if (!gis?.accounts?.oauth2) {
    throw new Error("failed");
  }
  return new Promise((resolve, reject) => {
    const client = gis.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_WEB,
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

async function loadFacebookSdk(): Promise<FacebookSdk> {
  if (window.FB) {
    return window.FB;
  }
  await new Promise<void>((resolve, reject) => {
    window.fbAsyncInit = () => {
      window.FB?.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
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
  if (!FACEBOOK_APP_ID) {
    throw new Error("not_configured");
  }
  const fb = await loadFacebookSdk();
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

export async function startTikTokWebLogin(): Promise<void> {
  if (!TIKTOK_CLIENT_KEY) {
    throw new Error("not_configured");
  }
  const verifier = randomOAuthString(32);
  const state = randomOAuthString(16);
  const challenge = await pkceChallenge(verifier);
  sessionStorage.setItem(TIKTOK_VERIFIER_KEY, verifier);
  sessionStorage.setItem(TIKTOK_STATE_KEY, state);
  sessionStorage.setItem(TIKTOK_PROVIDER_KEY, "tiktok");
  const params = new URLSearchParams({
    client_key: TIKTOK_CLIENT_KEY,
    redirect_uri: oauthRedirectUri(),
    response_type: "code",
    scope: "user.info.basic",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });
  window.location.assign(`https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`);
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
  const verifier = sessionStorage.getItem(TIKTOK_VERIFIER_KEY);
  sessionStorage.removeItem(TIKTOK_STATE_KEY);
  sessionStorage.removeItem(TIKTOK_VERIFIER_KEY);
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
    code_verifier: verifier || "",
  });
}
