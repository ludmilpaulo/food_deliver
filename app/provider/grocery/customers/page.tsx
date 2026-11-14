"use client";

import { useGetGroceryCustomersQuery } from "@/redux/slices/groceryPartnerApi";
import { useTranslation } from "@/hooks/useTranslation";

export default function Page() {
  const { t } = useTranslation();
  const { data = [] } = useGetGroceryCustomersQuery();
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{t("gpCustomers")}</h1>
      {data.length === 0 ? (
        <p className="text-[#6B7280]">{t("gpNoData")}</p>
      ) : (
        <ul className="space-y-2">
          {data.map((row) => (
            <li key={row.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
              <p className="font-semibold">{row.name || row.phone || `#${row.id}`}</p>
              {row.phone ? <p className="text-sm text-[#6B7280]">{row.phone}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
