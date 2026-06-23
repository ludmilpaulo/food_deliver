"use client";

import React, { Suspense } from "react";
import StoresPage from "../stores/StoresPage";
import { useTranslation } from "@/hooks/useTranslation";

export default function FoodPage() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<div>{t("loading")}</div>}>
      <StoresPage forcedVertical="food" />
    </Suspense>
  );
}
