"use client";

import { useGetGroceryPartnerSettingsQuery } from "@/features/grocery-partner/groceryPartnerApi";
import { useTranslation } from "@/hooks/useTranslation";

export default function Page() {
  const { t } = useTranslation();
  const { data } = useGetGroceryPartnerSettingsQuery();
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{t("gpStaff")}</h1>
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
        <p className="font-semibold">{data?.store_name}</p>
        <p className="text-sm text-[#6B7280]">{data?.phone}</p>
      </div>
    </div>
  );
}
