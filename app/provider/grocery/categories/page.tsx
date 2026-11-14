"use client";

import { useGetGroceryMetaQuery } from "@/redux/slices/groceryPartnerApi";
import { useTranslation } from "@/hooks/useTranslation";
import { groceryCategoryLabel, grocerySubcategoryLabel } from "@/utils/groceryUnits";

export default function Page() {
  const { t } = useTranslation();
  const { data } = useGetGroceryMetaQuery();
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{t("gpCategories")}</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(data?.categories ?? []).map((category) => (
          <div key={category.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <p className="font-semibold">{groceryCategoryLabel(t, category.slug, category.name)}</p>
            <p className="mt-1 text-sm text-[#6B7280]">
              {category.children.map((item) => grocerySubcategoryLabel(t, item.name)).join(", ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
