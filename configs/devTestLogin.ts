export const DEV_TEST_ADMIN_LOGIN = {
  username: "admin@kudya.shop",
  password: "seedpass123",
} as const;

export const DEV_TEST_DOCTOR_LOGIN = {
  username: "doctor@kudya.shop",
  password: "seedpass123",
} as const;

export const DEV_TEST_STORE_LOGIN = {
  username: "store@kudya.shop",
  password: "seedpass123",
} as const;

export const DEV_TEST_CUSTOMER_LOGIN = {
  username: "customer@kudya.shop",
  password: "seedpass123",
} as const;

export const DEV_TEST_ADMIN_LOGIN_BUTTON_LABEL = "Fill test admin login";
export const DEV_TEST_DOCTOR_LOGIN_BUTTON_LABEL = "Fill test doctor login";
export const DEV_TEST_STORE_LOGIN_BUTTON_LABEL = "Fill test store login";
export const DEV_TEST_CUSTOMER_LOGIN_BUTTON_LABEL = "Fill test customer login";

export const SEED_TEST_USERNAMES = [
  DEV_TEST_CUSTOMER_LOGIN.username,
  DEV_TEST_STORE_LOGIN.username,
  DEV_TEST_DOCTOR_LOGIN.username,
  "admin@kudya.shop",
  "driver@kudya.shop",
  "ana@kudya.shop",
] as const;

export function isDevLoginEnabled(): boolean {
  return process.env.NODE_ENV === "development";
}

export function isSeedTestUsername(username: string | undefined | null): boolean {
  if (!username) return false;
  return (SEED_TEST_USERNAMES as readonly string[]).includes(username);
}
