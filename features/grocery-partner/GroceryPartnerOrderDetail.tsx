"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import {
  useGetGroceryOrdersQuery,
  useGetGroceryProductsQuery,
  usePickGroceryOrderItemMutation,
  useUpdateGroceryOrderStatusMutation,
} from "@/redux/slices/groceryPartnerApi";
import { useTranslation } from "@/hooks/useTranslation";
import { sellingUnitTranslationKey } from "@/utils/groceryUnits";
import PageSpinner from "@/components/ui/PageSpinner";

const NEXT: Record<string, { status: string; labelKey: string } | undefined> = {
  new: { status: "accepted", labelKey: "gpAcceptOrder" },
  accepted: { status: "preparing", labelKey: "gpStartPreparing" },
  preparing: { status: "ready", labelKey: "gpReadyPickup" },
  ready: { status: "packed", labelKey: "gpPackOrder" },
  packed: { status: "courier_assigned", labelKey: "gpAssignCourier" },
  courier_assigned: { status: "out_for_delivery", labelKey: "gpOutForDelivery" },
  out_for_delivery: { status: "delivered", labelKey: "gpMarkDelivered" },
  picked_up: { status: "delivered", labelKey: "gpMarkDelivered" },
  handed_to_driver: { status: "delivered", labelKey: "gpMarkDelivered" },
  delivered: { status: "completed", labelKey: "gpCompleteOrder" },
};

export default function GroceryPartnerOrderDetail() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  // The partner API has no single-order endpoint; the order list carries full line items.
  const { data, isFetching, isError, refetch } = useGetGroceryOrdersQuery(undefined, {
    selectFromResult: (result) => ({ ...result, data: result.data?.find((order) => order.id === id) }),
  });
  const products = useGetGroceryProductsQuery();
  const [advance] = useUpdateGroceryOrderStatusMutation();
  const [pick] = usePickGroceryOrderItemMutation();
  const [subLine, setSubLine] = useState<number | null>(null);
  const [subProduct, setSubProduct] = useState("");

  if (!isError && isFetching && !data) return <PageSpinner color="green" />;
  if (isError || !data) {
    return (
      <button type="button" onClick={() => void refetch()} className="text-[#0B8F45]">
        {t("gpTryAgain")}
      </button>
    );
  }

  const groceryStatus = data.grocery_status || "new";
  const next = NEXT[groceryStatus];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">#{data.id}</h1>
          <p className="text-[#6B7280]">{data.customer?.name || "—"}</p>
        </div>
        <div className="flex gap-2">
          {groceryStatus === "new" ? (
            <button
              type="button"
              onClick={() => void advance({ id, status: "cancelled" })}
              className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700"
            >
              {t("gpRejectOrder")}
            </button>
          ) : null}
          {next ? (
            <button
              type="button"
              onClick={() => void advance({ id, status: next.status })}
              className="rounded-full bg-[#0B8F45] px-4 py-2 text-sm font-semibold text-white"
            >
              {t(next.labelKey)}
            </button>
          ) : null}
        </div>
      </div>
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="mb-3 font-semibold">{t("gpItems")}</h2>
        <ul className="space-y-3">
          {data.order_details.map((line) => (
            <li key={line.id} className="rounded-xl border border-[#E5E7EB] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {line.product.name} — {line.quantity} {t(sellingUnitTranslationKey(line.selling_unit, "gp"))}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {line.unit_price}/{t(sellingUnitTranslationKey(line.selling_unit, "gp")).toLowerCase()} · {line.sub_total}
                    {line.substituted_product ? ` · ${t("gpSubstituted")}: ${line.substituted_product.name}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  {(["found", "missing"] as const).map((pickStatus) => (
                    <button
                      key={pickStatus}
                      type="button"
                      onClick={() => void pick({ orderId: id, itemId: line.id, pick_status: pickStatus })}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        line.pick_status === pickStatus ? "bg-[#0B8F45] text-white" : "bg-[#F8FAF9]"
                      }`}
                    >
                      {t(pickStatus === "found" ? "gpFound" : "gpMissing")}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSubLine(line.id)}
                    className="rounded-full bg-[#F8FAF9] px-3 py-1 text-xs font-semibold"
                  >
                    {t("gpSubstitute")}
                  </button>
                </div>
              </div>
              {subLine === line.id ? (
                <div className="mt-2 flex gap-2">
                  <select
                    value={subProduct}
                    onChange={(e) => setSubProduct(e.target.value)}
                    className="flex-1 rounded-xl border border-[#E5E7EB] px-2 py-1 text-sm"
                  >
                    <option value="">{t("gpProducts")}</option>
                    {(products.data ?? [])
                      .filter((item) => item.id !== line.product.id)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    disabled={!subProduct}
                    onClick={() => {
                      void pick({
                        orderId: id,
                        itemId: line.id,
                        pick_status: "substituted",
                        substituted_product: Number(subProduct),
                      });
                      setSubLine(null);
                    }}
                    className="rounded-full bg-[#0B8F45] px-3 py-1 text-xs text-white"
                  >
                    {t("gpSaved")}
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
