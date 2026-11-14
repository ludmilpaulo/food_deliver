"use client";

import { useGetGroceryReviewsQuery } from "@/redux/slices/groceryPartnerApi";
import { useTranslation } from "@/hooks/useTranslation";

export default function Page() {
  const { t } = useTranslation();
  const { data = [] } = useGetGroceryReviewsQuery();
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{t("gpReviews")}</h1>
      {data.length === 0 ? (
        <p className="text-[#6B7280]">{t("gpNoData")}</p>
      ) : (
        <ul className="space-y-2">
          {data.map((row) => (
            <li key={row.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
              <p className="font-semibold">{row.product} · {row.rating}/5</p>
              <p className="text-sm text-[#6B7280]">{row.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
