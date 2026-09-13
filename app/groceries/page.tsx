"use client";

import React, { Suspense } from "react";
import GroceryPage from "@/features/groceries/components/GroceryPage";
import { useTranslation } from "@/hooks/useTranslation";

export default function GroceriesRoutePage() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<div className="grocery-shell min-h-screen bg-[#F8FAF9] p-8">{t("loading", "Loading...")}</div>}>
      <GroceryPage />
    </Suspense>
  );
}
