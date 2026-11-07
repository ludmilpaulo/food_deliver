"use client";

import { useGetGroceryPartnerCustomersQuery } from "@/features/grocery-partner/groceryPartnerApi";
import { useTranslation } from "@/hooks/useTranslation";

export default function Page() {
  const { t } = useTranslation();
  const { data = [] } = useGetGroceryPartnerCustomersQuery();
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{t("gpCustomers")}</h1>
      {data.length === 0 ? (
        <p className="text-[#6B7280]">{t("gpNoData")}</p>
      ) : (
        <ul className="space-y-2">
          {data.map((row) => (
            <li key={row.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
              <p className="font-semibold">{row.name || row.phone}</p>
              <p className="text-sm text-[#6B7280]">
                {row.orders} {t("gpOrders").toLowerCase()} · {row.spent}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
