"use client";

import React, { Suspense } from "react";
import StoresPage from "../stores/StoresPage";
import { useTranslation } from "@/hooks/useTranslation";

export default function GroceriesPage() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<div>{t("loading")}</div>}>
      <StoresPage forcedVertical="groceries" />
    </Suspense>
  );
}
