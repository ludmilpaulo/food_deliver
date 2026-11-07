"use client";

import Link from "next/link";
import { useState } from "react";
import { useGetGroceryPartnerOrdersQuery } from "./groceryPartnerApi";
import { useTranslation } from "@/hooks/useTranslation";
import { groceryOrderStatusTranslationKey } from "@/utils/groceryUnits";
import PageSpinner from "@/components/ui/PageSpinner";

const STATUSES = ["", "new", "accepted", "preparing", "ready", "picked_up", "delivered", "cancelled"];

export default function GroceryPartnerOrders() {
  const { t } = useTranslation();
  const [status, setStatus] = useState("");
  const { data, isFetching, isError, refetch } = useGetGroceryPartnerOrdersQuery(status || undefined);
  const orders = data ?? [];
  const pending = !isError && (isFetching || data === undefined);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("gpOrders")}</h1>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((value) => (
          <button
            key={value || "all"}
            type="button"
            onClick={() => setStatus(value)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              status === value ? "bg-[#0B8F45] text-white" : "bg-white border border-[#E5E7EB]"
            }`}
          >
            {value ? t(groceryOrderStatusTranslationKey(value)) : t("gpAll")}
          </button>
        ))}
      </div>
      {pending ? (
        <PageSpinner color="green" />
      ) : isError ? (
        <button type="button" onClick={() => void refetch()} className="text-[#0B8F45]">{t("gpTryAgain")}</button>
      ) : orders.length === 0 ? (
        <p className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center text-[#6B7280]">{t("gpEmptyOrders")}</p>
      ) : (
        <div className="grid gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/provider/grocery/orders/${order.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 hover:border-[#0B8F45]"
            >
              <div>
                <p className="font-semibold">{order.number}</p>
                <p className="text-sm text-[#6B7280]">{order.customer} · {order.items} {t("gpItems").toLowerCase()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{order.total}</p>
                <p className="text-xs font-semibold uppercase text-[#0B8F45]">{t(groceryOrderStatusTranslationKey(order.status))}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
