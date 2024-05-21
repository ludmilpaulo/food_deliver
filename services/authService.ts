import { baseAPI } from "./types";

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

  if (!response.ok) {
    return data;
  }

  return data;
};

export const signup = async (role: "client" | "restaurant", signupData: Record<string, any>) => {
  const url = role === "client" ? `${baseAPI}/customer/signup/` : `${baseAPI}/restaurant/fornecedor/`;

  let body: FormData | string | null = null;

  if (role === "client") {
    body = JSON.stringify({
      username: signupData.username,
      email: signupData.email,
      password: signupData.password,
      password2: signupData.password,
    });
  } else if (role === "restaurant") {
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
