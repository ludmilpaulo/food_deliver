import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseAPI } from "@/services/api";
import type { SupportedLocale } from "@/configs/translations";

export type LanguagePreference = {
  preferredLanguage: SupportedLocale | null;
  systemLanguage: SupportedLocale | null;
  activeLanguage: SupportedLocale | null;
  preferenceSet: boolean;
};

type RawRecord = Record<string, unknown>;

function asLocale(value: unknown): SupportedLocale | null {
  if (typeof value !== "string" || !value) return null;
  const code = value.slice(0, 2).toLowerCase();
  if (code === "en" || code === "pt" || code === "fr" || code === "es") {
    return code;
  }
  return null;
}

function mapLanguagePreference(raw: RawRecord): LanguagePreference {
  const hasFlag = "preferenceSet" in raw || "preference_set" in raw;
  const preferenceSet = raw.preferenceSet === true || raw.preference_set === true;
  const preferred =
    hasFlag && !preferenceSet
      ? null
      : asLocale(raw.preferredLanguage ?? raw.preferred_language);
  const system = asLocale(raw.systemLanguage ?? raw.system_language);
  return {
    preferredLanguage: preferred,
    systemLanguage: system,
    activeLanguage: asLocale(raw.activeLanguage ?? raw.active_language) ?? preferred ?? system,
    preferenceSet: hasFlag ? preferenceSet : preferred != null,
  };
}

function readAuthToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const token = JSON.parse(localStorage.getItem("auth_token") || "null");
    return typeof token === "string" ? token : undefined;
  } catch {
    return undefined;
  }
}

export const languageApi = createApi({
  reducerPath: "languageApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseAPI}/api/me`,
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      const lang = typeof window !== "undefined" ? localStorage.getItem("app_lang") : null;
      if (lang) headers.set("Accept-Language", lang);
      const token = readAuthToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getLanguagePreference: builder.query<LanguagePreference, void>({
      query: () => "/language/",
      transformResponse: (response: RawRecord) => mapLanguagePreference(response),
    }),
    updateLanguagePreference: builder.mutation<
      LanguagePreference,
      { preferredLanguage?: SupportedLocale; systemLanguage?: SupportedLocale | null }
    >({
      query: (body) => ({
        url: "/language/",
        method: "PATCH",
        body: {
          ...(body.preferredLanguage ? { preferredLanguage: body.preferredLanguage } : {}),
          ...(body.systemLanguage ? { systemLanguage: body.systemLanguage } : {}),
        },
      }),
      transformResponse: (response: RawRecord) => mapLanguagePreference(response),
    }),
  }),
});

export const {
  useGetLanguagePreferenceQuery,
  useUpdateLanguagePreferenceMutation,
} = languageApi;
