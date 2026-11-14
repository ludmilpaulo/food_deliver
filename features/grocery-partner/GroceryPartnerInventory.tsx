"use client";

import { useState } from "react";
import {
  useAdjustGroceryStockMutation,
  useGetGroceryInventoryQuery,
  useGetGroceryStockHistoryQuery,
} from "@/redux/slices/groceryPartnerApi";
import { useTranslation } from "@/hooks/useTranslation";
import {
  partnerStatusTranslationKey,
  sellingUnitTranslationKey,
  stockReasonTranslationKey,
} from "@/utils/groceryUnits";
import PageSpinner from "@/components/ui/PageSpinner";
import { allowsFractional, partnerStatus } from "./format";

export default function GroceryPartnerInventory() {
  const { t } = useTranslation();
  const { data, isFetching, isError, refetch } = useGetGroceryInventoryQuery();
  const history = useGetGroceryStockHistoryQuery();
  const [adjust] = useAdjustGroceryStockMutation();
  const [busyId, setBusyId] = useState<number | null>(null);
  const products = data ?? [];
  const pending = !isError && (isFetching || data === undefined);

  async function changeStock(id: number, adjustment: number) {
    setBusyId(id);
    try {
      await adjust({ id, adjustment, reason: "manual" }).unwrap();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("gpInventory")}</h1>
      {pending ? (
        <PageSpinner color="green" />
      ) : isError ? (
        <button type="button" onClick={() => void refetch()} className="text-[#0B8F45]">{t("gpTryAgain")}</button>
      ) : (
        <>
      <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-[#F8FAF9] text-[#6B7280]">
            <tr>
              <th className="px-4 py-3 font-medium">{t("gpProducts")}</th>
              <th className="px-4 py-3 font-medium">{t("gpAvailableQty")}</th>
              <th className="px-4 py-3 font-medium">{t("gpSoldBy")}</th>
              <th className="px-4 py-3 font-medium">{t("gpPricePer")}</th>
              <th className="px-4 py-3 font-medium">{t("gpStatus")}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-[#E5E7EB]">
                <td className="px-4 py-3 font-medium">{product.name}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busyId === product.id}
                      onClick={() => void changeStock(product.id, allowsFractional(product.selling_unit) ? -0.5 : -1)}
                      className="h-8 w-8 rounded-full border border-[#E5E7EB]"
                    >
                      −
                    </button>
                    <span>
                      {product.stock_quantity} {t(sellingUnitTranslationKey(product.selling_unit, "gp"))}
                    </span>
                    <button
                      type="button"
                      disabled={busyId === product.id}
                      onClick={() => void changeStock(product.id, allowsFractional(product.selling_unit) ? 0.5 : 1)}
                      className="h-8 w-8 rounded-full bg-[#0B8F45] text-white"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">{t(sellingUnitTranslationKey(product.selling_unit, "gp"))}</td>
                <td className="px-4 py-3">
                  {product.price_display || `${product.currency ?? ""} ${product.price}`}
                </td>
                <td className="px-4 py-3">{t(partnerStatusTranslationKey(partnerStatus(product)))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="mb-3 font-semibold">{t("gpStockHistory")}</h2>
        {(history.data ?? []).length === 0 ? (
          <p className="text-sm text-[#6B7280]">{t("gpNoData")}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {(history.data ?? []).slice(0, 20).map((row) => (
              <li key={row.id} className="flex justify-between gap-3 border-b border-[#E5E7EB] pb-2">
                <span>
                  {row.product}: {row.previous_quantity} → {row.new_quantity} ({t(stockReasonTranslationKey(row.reason))})
                </span>
                <span className="text-[#6B7280]">{new Date(row.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
        </>
      )}
    </div>
  );
}
