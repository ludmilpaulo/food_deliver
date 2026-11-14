import { baseAPI } from "./types";
import { readAuthToken } from "@/lib/authToken";

import axios, { isAxiosError } from 'axios';
const API_URL = baseAPI;

type SignupRole = "client" | "store";

type SignupData = {
  username: string;
  email: string;
  password: string;
  name?: string;
  phone?: string;
  address?: string;
  logo?: File | null;
  store_license?: File | null;
  business_category?: string;
};

export const MFA_REQUIRED_ERROR = "mfa_required";
/** Login error prefix; the rest of the message is the short-lived setup token. */
export const MFA_SETUP_REQUIRED_PREFIX = "mfa_setup_required:";

async function postMfa<T>(path: string, body: Record<string, string>, fallback: string): Promise<T> {
  const response = await fetch(`${baseAPI}/api/auth/mfa/${path}`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) throw new Error(String(data.detail || fallback));
  return data as T;
}

export function startLoginMfaSetup(mfaToken: string) {
  return postMfa<{ secret: string; otpauth_uri: string }>(
    "setup-token/",
    { mfa_token: mfaToken },
    "Authenticator setup could not start.",
  );
}

export function confirmLoginMfaSetup(mfaToken: string, code: string) {
  return postMfa<{ enabled: boolean }>(
    "confirm/",
    { mfa_token: mfaToken, code },
    "That code did not match. Try the current code.",
  );
}

export const loginUserService = async (username: string, password: string, mfaCode?: string) => {
  let response: Response;
  try {
    response = await fetch(`${baseAPI}/api/auth/login/`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mfaCode ? { username, password, mfa_code: mfaCode } : { username, password }),
    });
  } catch {
    throw new Error(
      `Cannot reach API at ${baseAPI}. Start Kudya backend: cd www_kudya_shop && python manage.py runserver 8002`,
    );
  }

  let data: Record<string, unknown> = {};
  try {
    data = await response.json();
  } catch {
    if (response.status === 404) {
      throw new Error(
        `Login endpoint not found on ${baseAPI}. Use the Kudya backend (www_kudya_shop), not another Django app on port 8001.`,
      );
    }
    throw new Error("Server returned an invalid response.");
  }

  if (data.mfa_required && !data.access && !data.token) {
    if (mfaCode) throw new Error(String(data.detail || "Invalid authenticator code."));
    throw new Error(MFA_REQUIRED_ERROR);
  }
  if (data.mfa_setup_required && !data.access && !data.token) {
    if (!data.mfa_token) {
      throw new Error(String(data.detail || "This account must set up an authenticator before signing in."));
    }
    throw new Error(`${MFA_SETUP_REQUIRED_PREFIX}${String(data.mfa_token)}`);
  }

  if (!response.ok) {
    const detail = String(data.detail || data.message || "Login failed. Check username and password.");
    const apiHint =
      process.env.NODE_ENV === "development"
        ? ` (API: ${baseAPI})`
        : "";
    throw new Error(`${detail}${apiHint}`);
  }

  const token = String(data.token || data.access || "");
  if (!token) {
    throw new Error("Login succeeded but no token was returned.");
  }

  return {
    ...data,
    token,
    access: data.access || token,
  } as {
    token: string;
    access?: string;
    refresh?: string;
    user_id: number;
    username: string;
    role?: string;
    is_platform_admin?: boolean;
    is_customer: boolean;
    is_driver: boolean;
    message: string;
    business_profile?: {
      id: number;
      businessName: string;
      category: string;
      dashboardRoute: string;
      isApproved: boolean;
      isActive: boolean;
    };
  };
};

export const signup = async (role: SignupRole, signupData: SignupData) => {
  const url = role === "client" ? `${baseAPI}/customer/signup/` : `${baseAPI}/store/fornecedor/`;

  let body: FormData | string | null = null;

  if (role === "client") {
    body = JSON.stringify({
      username: signupData.username,
      email: signupData.email,
      password: signupData.password,
      password2: signupData.password,  // Ensure this field is included
    });
  } else if (role === "store") {
    const formData = new FormData();
    formData.append("username", signupData.username);
    formData.append("email", signupData.email);
    formData.append("password", signupData.password);
    if (signupData.name) formData.append("name", signupData.name);
    if (signupData.phone) formData.append("phone", signupData.phone);
    if (signupData.address) formData.append("address", signupData.address);
    if (signupData.business_category) formData.append("business_category", signupData.business_category);
    if (signupData.logo) formData.append("logo", signupData.logo);
    if (signupData.store_license) formData.append("store_license", signupData.store_license);

    body = formData;
  }

  const headers = role === "client"
    ? {
        Accept: "application/json",
        "Content-Type": "application/json",
      }
    : undefined; // For form data, no need for specific headers

  const res = await fetch(url, {
    method: "POST",
    headers: headers,
    body: body as BodyInit, // Type assertion to satisfy TypeScript
  });

  const data = await res.json();
  return {
    status: res.status,
    data: data as {
      message?: string;
      status?: string;
      business_profile?: {
        id: number;
        businessName: string;
        category: string;
        dashboardRoute: string;
        isApproved: boolean;
        isActive: boolean;
      };
    },
  };
};


export const resetPassword = async (uid: string, token: string, newPassword: string) => {
  try {
    const response = await axios.post(`${baseAPI}/conta/reset-password-confirm/`, { uid, token, newPassword });
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw error.response?.data;
    }
    throw error;
  }
};

export const getCurrentUser = async (user_id: number) => {
  try {
    const token = readAuthToken();
    const response = await axios.get(`${API_URL}/customer/customer/profile/?user_id=${user_id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw error.response?.data;
    }
    throw error;
  }
};



export const updateUserDetails = async (token: string, data: FormData) => {
  const response = await fetch(`${baseAPI}/customer/customer/profile/update/`, {
    method: "POST",
    headers: {
      'Accept': 'application/json',
    },
    body: data
  });
  return response;
};
