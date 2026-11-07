"use client";

import { useTranslation } from "@/hooks/useTranslation";

export default function Page() {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
      <h1 className="text-2xl font-bold">{t("gpHelp")}</h1>
      <p className="mt-3 text-[#6B7280]">{t("gpGreetingSub")}</p>
    </div>
  );
}
