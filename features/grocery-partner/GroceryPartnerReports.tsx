"use client";

import { useState } from "react";
import {
  useGetGroceryAnalyticsQuery,
  useGetGroceryDashboardQuery,
  useGetGroceryRevenueQuery,
  useGetGrocerySalesQuery,
  useUpdateGroceryAvailabilityMutation,
} from "@/redux/slices/groceryPartnerApi";
import { useTranslation } from "@/hooks/useTranslation";
import PageSpinner from "@/components/ui/PageSpinner";

export function GroceryPartnerSalesPage() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState("7d");
  const { data, isFetching } = useGetGrocerySalesQuery(period);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("gpSales")}</h1>
      <div className="flex flex-wrap gap-2">
        {[
          ["today", "gpToday"],
          ["7d", "gp7Days"],
          ["30d", "gp30Days"],
          ["3m", "gp3Months"],
          ["12m", "gp12Months"],
        ].map(([value, key]) => (
          <button
            key={value}
            type="button"
            onClick={() => setPeriod(value)}
            className={`rounded-full px-3 py-1.5 text-sm ${period === value ? "bg-[#0B8F45] text-white" : "border border-[#E5E7EB] bg-white"}`}
          >
            {t(key)}
          </button>
        ))}
      </div>
      {isFetching || !data ? (
        <PageSpinner color="green" />
      ) : (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <div className="flex h-48 items-end gap-1">
            {data.sales.map((value, index) => {
              const max = Math.max(...data.sales, 1);
              return (
                <div
                  key={data.labels[index]}
                  className="flex-1 rounded-t-md bg-[#0B8F45]"
                  style={{ height: `${Math.max(6, (value / max) * 100)}%` }}
                />
              );
            })}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label={t("gpSales")} value={String(data.summary.total_sales)} />
            <Stat label={t("gpOrders")} value={String(data.summary.orders)} />
            <Stat label={t("gpAvgOrder")} value={String(data.summary.average_order_value)} />
            <Stat label={t("gpCompletedOrders")} value={String(data.summary.completed_orders)} />
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-[#6B7280]">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

export function GroceryPartnerRevenuePage({ titleKey = "gpRevenue" }: { titleKey?: string }) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState("month");
  const { data, isFetching } = useGetGroceryRevenueQuery({ range: period });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t(titleKey)}</h1>
      <div className="flex gap-2">
        {(
          [
            ["today", "gpToday"],
            ["week", "gpWeek"],
            ["month", "gpMonth"],
          ] as const
        ).map(([value, key]) => (
          <button
            key={value}
            type="button"
            onClick={() => setPeriod(value)}
            className={`rounded-full px-3 py-1.5 text-sm ${period === value ? "bg-[#0B8F45] text-white" : "border bg-white"}`}
          >
            {t(key)}
          </button>
        ))}
      </div>
      {isFetching || !data ? (
        <PageSpinner color="green" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card label={t("gpGrossSales")} value={data.gross_sales} />
          <Card label={t("gpCommission")} value={data.commission} />
          <Card label={t("gpDeliveryCharges")} value={data.delivery_charges} />
          <Card label={t("gpDiscounts")} value={data.discounts} />
          <Card label={t("gpRefunds")} value={data.refunds} />
          <Card label={t("gpNetEarnings")} value={data.net_earnings} />
          <Card label={t("gpPendingPayout")} value={data.pending_payout} />
          <Card label={t("gpPaidOut")} value={data.paid_out} />
        </div>
      )}
    </div>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <p className="text-sm text-[#6B7280]">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

export function GroceryPartnerAnalyticsPage() {
  const { t } = useTranslation();
  const { data, isFetching } = useGetGroceryAnalyticsQuery();
  if (isFetching || !data) return <PageSpinner color="green" />;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("gpAnalytics")}</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card label={t("gpSales")} value={data.sales} />
        <Card label={t("gpOrders")} value={data.orders} />
        <Card label={t("gpAvgOrder")} value={data.average_order_value} />
        <Card label={t("gpCustomers")} value={data.customer_repeat_rate} />
      </div>
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="mb-3 font-semibold">{t("gpBestSellers")}</h2>
        <ol className="space-y-2">
          {data.best_selling.map((item, index) => (
            <li key={item.id}>
              {index + 1}. {item.name} — {item.sold}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export function GroceryPartnerSettingsPage({ titleKey = "gpStoreProfile" }: { titleKey?: string }) {
  const { t } = useTranslation();
  const { data, isFetching } = useGetGroceryDashboardQuery();
  const [save] = useUpdateGroceryAvailabilityMutation();
  if (isFetching && !data) return <PageSpinner color="green" />;
  if (!data) return null;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t(titleKey)}</h1>
      <label className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4">
        <input
          type="checkbox"
          checked={data.accepting_orders}
          onChange={(e) => void save({ accepting_orders: e.target.checked })}
        />
        <span>{data.accepting_orders ? t("gpAcceptingOrders") : t("gpStoreUnavailable")}</span>
      </label>
      <div className="grid gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <p className="font-semibold">{data.store.name}</p>
        <p className="text-sm text-[#6B7280]">{data.store.address}</p>
        <p className="text-sm text-[#6B7280]">{data.store.phone}</p>
        <a href="/groceries" className="text-sm font-medium text-[#0B8F45]">
          {t("gpViewAsCustomer")}
        </a>
      </div>
    </div>
  );
}
