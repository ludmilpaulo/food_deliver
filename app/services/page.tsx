"use client";
import React, { Suspense } from "react";
import ServicesPage from "./ServicesPage";
import { useTranslation } from "@/hooks/useTranslation";

export default function Page() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<div>{t("loading")}</div>}>
      <ServicesPage />
    </Suspense>
  );
}


