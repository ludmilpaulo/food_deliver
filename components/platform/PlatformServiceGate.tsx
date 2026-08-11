"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { fetchPlatformService, type ClientPlatform } from "@/services/platformApi";
import type { SupportedLocale } from "@/configs/translations";

type Props = {
  slug: string;
  platform?: ClientPlatform;
  lang?: SupportedLocale;
  children: React.ReactNode;
};

/**
 * Blocks deep-linked pages when Django marks the platform service inactive.
 */
export default function PlatformServiceGate({
  slug,
  platform = "web",
  lang,
  children,
}: Props) {
  const { t, languageCode } = useTranslation();
  const [state, setState] = useState<"loading" | "ok" | "unavailable">("loading");
  const currentLang = lang || languageCode;

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    fetchPlatformService(slug, currentLang, platform)
      .then((service) => {
        if (!cancelled) setState(service ? "ok" : "unavailable");
      })
      .catch(() => {
        if (!cancelled) setState("unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, [slug, platform, currentLang]);

  if (state === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (state === "unavailable") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          {t("serviceUnavailable", "This service is currently unavailable.")}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {t("serviceUnavailableHint", "Please check back later or choose another Kudya service.")}
        </p>
        <Link href="/" className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">
          {t("backHome", "Back to home")}
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
