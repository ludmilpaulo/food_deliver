export function readAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('auth_token');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return typeof parsed === 'string' && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export type StoredAuthUser = {
  user_id?: number;
  username?: string;
  role?: string;
  is_platform_admin?: boolean;
};

export function readStoredAuthUser(): StoredAuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('auth_user');
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuthUser;
  } catch {
    return null;
  }
}

export function writeAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('auth_token', JSON.stringify(token));
  } catch {
    // ignore storage failures
  }
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  } catch {
    // ignore storage failures
  }
}
