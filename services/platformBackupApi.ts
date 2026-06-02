export type BackupType = "full" | "database" | "files";

export type BackupStatus = "processing" | "completed" | "failed";

export interface PlatformBackup {
  id: number;
  name: string;
  backup_type: BackupType;
  backup_type_label: string;
  status: BackupStatus;
  status_label: string;
  file_size: number;
  file_size_human: string;
  created_by: number | null;
  created_by_email: string | null;
  created_by_name: string | null;
  error_message: string;
  metadata: Record<string, unknown>;
  created_at: string;
  completed_at: string | null;
}

export interface BackupSummary {
  total_backups: number;
  completed_backups: number;
  last_backup_date: string | null;
  last_backup_size: number;
  storage_used_bytes: number;
}

export interface BackupListFilters {
  search?: string;
  backup_type?: BackupType | "";
  status?: BackupStatus | "";
  date_from?: string;
  date_to?: string;
}

export interface CreateBackupPayload {
  backup_type: BackupType;
  name?: string;
}

function authHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    try {
      const token = JSON.parse(localStorage.getItem("auth_token") || "null") as string | null;
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      const adminToken = localStorage.getItem("adminToken");
      if (adminToken) {
        headers.Authorization = `Bearer ${adminToken}`;
      }
    }
  }
  return headers;
}

function getBaseApi(): string {
  return process.env.NEXT_PUBLIC_BASE_API || "https://kudya-api.onrender.com";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / (1024 ** 2)).toFixed(1)} MB`;
  return `${(bytes / (1024 ** 3)).toFixed(2)} GB`;
}

export async function fetchBackupSummary(): Promise<BackupSummary> {
  const response = await fetch(`${getBaseApi()}/api/platform/backups/summary/`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { detail?: string };
    throw new Error(body.detail || "Failed to load backup summary");
  }
  return response.json() as Promise<BackupSummary>;
}

export async function fetchBackups(filters: BackupListFilters = {}): Promise<PlatformBackup[]> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.backup_type) params.set("backup_type", filters.backup_type);
  if (filters.status) params.set("status", filters.status);
  if (filters.date_from) params.set("date_from", filters.date_from);
  if (filters.date_to) params.set("date_to", filters.date_to);

  const query = params.toString();
  const url = `${getBaseApi()}/api/platform/backups/${query ? `?${query}` : ""}`;
  const response = await fetch(url, { headers: authHeaders() });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { detail?: string };
    throw new Error(body.detail || "Failed to load backups");
  }
  return response.json() as Promise<PlatformBackup[]>;
}

export async function createBackup(payload: CreateBackupPayload): Promise<PlatformBackup> {
  const response = await fetch(`${getBaseApi()}/api/platform/backups/create/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { detail?: string };
    throw new Error(body.detail || "Failed to create backup");
  }
  return response.json() as Promise<PlatformBackup>;
}

export async function fetchBackupStatus(id: number): Promise<PlatformBackup> {
  const response = await fetch(`${getBaseApi()}/api/platform/backups/status/${id}/`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { detail?: string };
    throw new Error(body.detail || "Failed to fetch backup status");
  }
  return response.json() as Promise<PlatformBackup>;
}

export async function downloadBackup(id: number, filename: string): Promise<void> {
  const response = await fetch(`${getBaseApi()}/api/platform/backups/${id}/download/`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { detail?: string };
    throw new Error(body.detail || "Failed to download backup");
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".zip") ? filename : `${filename}.zip`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function deleteBackup(id: number): Promise<void> {
  const response = await fetch(`${getBaseApi()}/api/platform/backups/${id}/delete/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok && response.status !== 204) {
    const body = (await response.json().catch(() => ({}))) as { detail?: string };
    throw new Error(body.detail || "Failed to delete backup");
  }
}
