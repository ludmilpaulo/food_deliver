import { baseAPI } from "./types";
import type { SupportedLocale } from "@/configs/translations";

export async function fetchApiTranslations(
  lang: SupportedLocale,
  module?: string,
): Promise<Record<string, string>> {
  const params = new URLSearchParams({ lang });
  if (module) params.set("module", module);
  const response = await fetch(`${baseAPI}/api/translations/?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to load translations");
  }
  return response.json() as Promise<Record<string, string>>;
}
