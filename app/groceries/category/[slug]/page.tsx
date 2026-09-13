"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import GroceryPage from "@/features/groceries/components/GroceryPage";
import { useTranslation } from "@/hooks/useTranslation";

export default function GroceryCategoryRoutePage() {
  const { t } = useTranslation();
  const params = useParams<{ slug: string }>();
  const slug = typeof params.slug === "string" ? params.slug : "";
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAF9] p-8">{t("loading", "Loading...")}</div>}>
      <GroceryPage categorySlug={slug} />
    </Suspense>
  );
}
