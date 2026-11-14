"use client";

import { useGetGroceryStaffQuery } from "@/redux/slices/groceryPartnerApi";
import { useTranslation } from "@/hooks/useTranslation";

export default function Page() {
  const { t } = useTranslation();
  const { data = [] } = useGetGroceryStaffQuery();
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{t("gpStaff")}</h1>
      {data.length === 0 ? (
        <p className="text-[#6B7280]">{t("gpNoData")}</p>
      ) : (
        <ul className="space-y-2">
          {data.map((member) => (
            <li key={member.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
              <p className="font-semibold">
                {member.name} · <span className="capitalize">{member.role}</span>
              </p>
              <p className="text-sm text-[#6B7280]">{[member.phone, member.email].filter(Boolean).join(" · ")}</p>
              {!member.is_active ? <p className="text-xs text-[#6B7280]">{t("gpInactive")}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
