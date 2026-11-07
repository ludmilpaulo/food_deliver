"use client";

import { useGetGroceryPartnerMetaQuery } from "@/features/grocery-partner/groceryPartnerApi";
import { useTranslation } from "@/hooks/useTranslation";
import { groceryCategoryTranslationKey, grocerySubcategoryTranslationKey } from "@/utils/groceryUnits";

export default function Page() {
  const { t } = useTranslation();
  const { data } = useGetGroceryPartnerMetaQuery();
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{t("gpCategories")}</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(data?.categories ?? []).map((category) => (
          <div key={category.slug} className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <p className="font-semibold">{t(groceryCategoryTranslationKey(category.slug), category.name)}</p>
            <p className="mt-1 text-sm text-[#6B7280]">
              {category.subcategories.map((item) => t(grocerySubcategoryTranslationKey(item), item)).join(", ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
