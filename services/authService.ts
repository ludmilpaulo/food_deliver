import { baseAPI } from "./types";

import axios, { isAxiosError } from 'axios';
const API_URL = baseAPI;

export const loginUserService = async (username: string, password: string) => {
  const response = await fetch(`${baseAPI}/conta/login/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  console.log("Login response:", data);

  if (!response.ok) {
    return data;
  }

  return data;
};

export const signup = async (role: "client" | "store", signupData: Record<string, any>) => {
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
    Object.keys(signupData).forEach((key) => {
      const value = signupData[key];
      if (value !== null) {
        formData.append(key, value);
      }
    });

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
  return { status: res.status, data };
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
    const response = await axios.get(`${API_URL}/customer/customer/profile/?user_id=${user_id}`);
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