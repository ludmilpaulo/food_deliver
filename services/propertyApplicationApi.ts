import { baseAPI } from "@/services/types";
import { readAuthToken } from "@/lib/authToken";
import type {
  ApplicationDocument,
  ApplicationLease,
  MyDocumentsResponse,
  PropertyApplicationDetail,
  PropertyApplicationDraftPayload,
  PropertyApplicationListItem,
  PropertyServicesSummary,
  PropertyViewing,
} from "@/types/propertyApplication";

export class PropertyApplicationApiError extends Error {
  status: number;
  fieldErrors: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = "PropertyApplicationApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeFieldErrors(data: unknown): Record<string, string[]> {
  if (!isRecord(data)) return {};
  const out: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === "detail" || key === "non_field_errors") continue;
    if (Array.isArray(value)) {
      out[key] = value.map((item) => String(item));
    } else if (typeof value === "string") {
      out[key] = [value];
    }
  }
  return out;
}

function errorMessageFromBody(data: unknown, fallback: string): string {
  if (!isRecord(data)) return fallback;
  if (typeof data.detail === "string" && data.detail.trim()) return data.detail;
  if (Array.isArray(data.detail) && data.detail.length > 0) {
    return data.detail.map((item) => String(item)).join(" ");
  }
  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
    return data.non_field_errors.map((item) => String(item)).join(" ");
  }
  const fields = normalizeFieldErrors(data);
  const first = Object.values(fields)[0];
  if (first?.[0]) return first[0];
  return fallback;
}

async function parseJson(res: Response): Promise<unknown> {
  return res.json().catch(() => ({}));
}

async function authFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = readAuthToken();
  if (!token) {
    throw new PropertyApplicationApiError("Authentication required.", 401);
  }
  const headers = new Headers(init?.headers || {});
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);
  if (init?.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${baseAPI}${path}`, { ...init, headers });
}

async function authJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await authFetch(path, init);
  const data = await parseJson(res);
  if (!res.ok) {
    throw new PropertyApplicationApiError(
      errorMessageFromBody(data, "Request failed"),
      res.status,
      normalizeFieldErrors(data),
    );
  }
  return data as T;
}

const ROOT = "/properties/applications";

export async function listPropertyApplications(): Promise<PropertyApplicationListItem[]> {
  const data = await authJson<unknown>(`${ROOT}/`);
  return Array.isArray(data) ? (data as PropertyApplicationListItem[]) : [];
}

export async function createPropertyApplicationDraft(
  propertyId: number,
): Promise<PropertyApplicationDetail> {
  return authJson<PropertyApplicationDetail>(`${ROOT}/`, {
    method: "POST",
    body: JSON.stringify({ property_id: propertyId }),
  });
}

export async function getPropertyApplication(
  id: number,
): Promise<PropertyApplicationDetail> {
  return authJson<PropertyApplicationDetail>(`${ROOT}/${id}/`);
}

export async function patchPropertyApplication(
  id: number,
  payload: PropertyApplicationDraftPayload,
): Promise<PropertyApplicationDetail> {
  return authJson<PropertyApplicationDetail>(`${ROOT}/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function submitPropertyApplication(
  id: number,
): Promise<PropertyApplicationDetail> {
  return authJson<PropertyApplicationDetail>(`${ROOT}/${id}/submit/`, {
    method: "POST",
    body: "{}",
  });
}

export async function uploadApplicationDocument(
  applicationId: number,
  documentType: string,
  file: File,
): Promise<ApplicationDocument> {
  const fd = new FormData();
  fd.append("document_type", documentType);
  fd.append("file", file);
  return authJson<ApplicationDocument>(`${ROOT}/${applicationId}/documents/`, {
    method: "POST",
    body: fd,
  });
}

export async function confirmPropertyViewing(
  applicationId: number,
  viewingId: number,
): Promise<PropertyViewing> {
  return authJson<PropertyViewing>(
    `${ROOT}/${applicationId}/viewings/${viewingId}/confirm/`,
    { method: "POST", body: "{}" },
  );
}

export async function reschedulePropertyViewing(
  applicationId: number,
  viewingId: number,
  note: string,
): Promise<PropertyViewing> {
  return authJson<PropertyViewing>(
    `${ROOT}/${applicationId}/viewings/${viewingId}/reschedule/`,
    { method: "POST", body: JSON.stringify({ note }) },
  );
}

export async function getApplicationLease(
  applicationId: number,
): Promise<ApplicationLease> {
  return authJson<ApplicationLease>(`${ROOT}/${applicationId}/lease/`);
}

export async function signLease(
  leaseId: number,
  signatureName: string,
): Promise<ApplicationLease> {
  return authJson<ApplicationLease>(`/properties/leases/${leaseId}/sign/`, {
    method: "POST",
    body: JSON.stringify({ signature_name: signatureName }),
  });
}

export async function fetchPropertyServices(): Promise<PropertyServicesSummary> {
  return authJson<PropertyServicesSummary>("/properties/me/services/");
}

export async function fetchMyPropertyDocuments(): Promise<MyDocumentsResponse> {
  const data = await authJson<MyDocumentsResponse>("/properties/me/documents/");
  return {
    application_documents: Array.isArray(data.application_documents)
      ? data.application_documents
      : [],
    leases: Array.isArray(data.leases) ? data.leases : [],
  };
}

export async function downloadAuthenticatedBlob(path: string): Promise<Blob> {
  const token = readAuthToken();
  if (!token) {
    throw new PropertyApplicationApiError("Authentication required.", 401);
  }
  const url = path.startsWith("http")
    ? path
    : `${baseAPI}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new PropertyApplicationApiError("Download failed", res.status);
  }
  return res.blob();
}

export function requirementLabel(
  req: {
    document_type: string;
    label_en?: string;
    label_pt?: string;
    label_fr?: string;
    label_es?: string;
  },
  languageCode: string,
): string {
  const map: Record<string, string | undefined> = {
    en: req.label_en,
    pt: req.label_pt,
    fr: req.label_fr,
    es: req.label_es,
  };
  return map[languageCode] || req.label_en || req.document_type;
}
