import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseAPI } from "@/services/api";
import type { SupportedLocale } from "@/configs/translations";

export type LanguagePreference = {
  preferredLanguage: SupportedLocale;
  systemLanguage: SupportedLocale | null;
  activeLanguage: SupportedLocale;
};

type RawRecord = Record<string, unknown>;

function mapLanguagePreference(raw: RawRecord): LanguagePreference {
  const preferred = String(raw.preferredLanguage ?? raw.preferred_language ?? "en") as SupportedLocale;
  const systemRaw = raw.systemLanguage ?? raw.system_language;
  const active = String(raw.activeLanguage ?? raw.active_language ?? preferred) as SupportedLocale;
  return {
    preferredLanguage: preferred,
    systemLanguage: systemRaw ? (String(systemRaw) as SupportedLocale) : null,
    activeLanguage: active,
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
      { preferredLanguage: SupportedLocale; systemLanguage?: SupportedLocale | null }
    >({
      query: (body) => ({
        url: "/language/",
        method: "PATCH",
        body: {
          preferredLanguage: body.preferredLanguage,
          systemLanguage: body.systemLanguage,
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
