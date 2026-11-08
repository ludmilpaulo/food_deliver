import { baseAPI } from "@/services/types";

function normalizeToken(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Read the JWT from localStorage.
 * Accepts both JSON-stringified tokens (`"eyJ..."`) and raw JWTs (`eyJ...`).
 * Never throws — malformed storage returns null.
 */
export function readAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth_token");
    if (!raw) return null;
    const trimmed = raw.trim();
    if (!trimmed) return null;

    // Preferred format: JSON.stringify(token)
    if (trimmed.startsWith('"') || trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return normalizeToken(JSON.parse(trimmed));
      } catch {
        // Fall through to raw / repair paths below.
      }
    }

    // Legacy / mistaken writes: bare JWT without JSON quotes
    if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(trimmed)) {
      return trimmed;
    }

    // Last resort: try JSON.parse anyway (wrapped in catch)
    try {
      return normalizeToken(JSON.parse(trimmed));
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

export type StoredAuthUser = {
  user_id?: number;
  username?: string;
  role?: string;
  is_platform_admin?: boolean;
  is_customer?: boolean;
  is_driver?: boolean;
  business_profile?: {
    id: number;
    businessName: string;
    category: string;
    dashboardRoute: string;
    isApproved: boolean;
    isActive: boolean;
  };
};

export function readStoredAuthUser(): StoredAuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth_user");
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuthUser;
  } catch {
    return null;
  }
}

export function writeStoredAuthUser(user: StoredAuthUser): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("auth_user", JSON.stringify(user));
  } catch {
    // ignore storage failures
  }
}

export function writeAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("auth_token", JSON.stringify(token));
  } catch {
    // ignore storage failures
  }
}

export function readRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth_refresh");
    if (!raw) return null;
    const trimmed = raw.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('"') || trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return normalizeToken(JSON.parse(trimmed));
      } catch {
        return null;
      }
    }
    return normalizeToken(trimmed);
  } catch {
    return null;
  }
}

export function writeRefreshToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("auth_refresh", JSON.stringify(token));
  } catch {
    // ignore storage failures
  }
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_refresh");
  } catch {
    // ignore storage failures
  }
}

let refreshInFlight: Promise<string | null> | null = null;

/** Exchange the stored refresh token for a new access token. Returns null when that is not possible. */
export function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const refresh = readRefreshToken();
    if (!refresh) return null;
    try {
      const response = await fetch(`${baseAPI}/api/auth/refresh/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh }),
      });
      if (!response.ok) return null;
      const data = (await response.json()) as { access?: string; token?: string; refresh?: string };
      const access = normalizeToken(data.access) || normalizeToken(data.token);
      if (!access) return null;
      writeAuthToken(access);
      if (data.refresh) writeRefreshToken(data.refresh);
      return access;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}
