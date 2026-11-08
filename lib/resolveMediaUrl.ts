import { baseAPI } from "@/services/types";

const FALLBACK_PRODUCT_IMAGE = "/no-image.png";

function isUsableImagePath(path: string): boolean {
  const trimmed = path.trim();
  if (!trimmed || trimmed === "/") return false;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const url = new URL(trimmed);
      return url.pathname.length > 1;
    } catch {
      return false;
    }
  }
  return true;
}

function firstImagePath(value: string | string[] | null | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value.find((item) => typeof item === "string" && isUsableImagePath(item));
  }
  if (typeof value === "string" && isUsableImagePath(value)) {
    return value;
  }
  return undefined;
}

/** Build a Next/Image-safe URL for Django media or absolute image paths. */
export function resolveMediaUrl(path: string | null | undefined): string {
  if (!path || !isUsableImagePath(path)) {
    return FALLBACK_PRODUCT_IMAGE;
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (path.startsWith("/")) {
    return `${baseAPI}${path}`;
  }
  return `${baseAPI}/${path}`;
}

export function resolveProductImageUrl(
  imageUrl?: string | string[] | null,
  images?: string | string[] | null,
): string {
  const path = firstImagePath(imageUrl) ?? firstImagePath(images);
  return resolveMediaUrl(path);
}
