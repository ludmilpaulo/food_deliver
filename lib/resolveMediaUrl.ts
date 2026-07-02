import { baseAPI } from "@/services/types";

const FALLBACK_PRODUCT_IMAGE = "/no-image.png";

/** Build a Next/Image-safe URL for Django media or absolute image paths. */
export function resolveMediaUrl(path: string | null | undefined): string {
  if (!path || !path.trim()) {
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
  imageUrl?: string[] | null,
  images?: string[] | null,
): string {
  const path = imageUrl?.[0] ?? images?.[0];
  return resolveMediaUrl(path);
}
