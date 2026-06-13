"use client";
import React, { Suspense } from "react";
import StoresPage from "./StoresPage"; // <-- create and move the real component here
import { useTranslation } from "@/hooks/useTranslation";

export default function Page() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<div>{t("loading")}</div>}>
      <StoresPage />
    </Suspense>
  );
}
