"use client";

import Link from "next/link";
import {
  PackagePlus,
  ShoppingBag,
  Warehouse,
  Percent,
  Package,
  AlertTriangle,
  Clock,
  Wallet,
} from "lucide-react";
import { useGetGroceryPartnerDashboardQuery, useGetGroceryPartnerSalesQuery } from "./groceryPartnerApi";
import { useTranslation } from "@/hooks/useTranslation";
import { GROCERY_THEME } from "@/features/groceries/theme";
import type { GroceryPartnerSales } from "./types";
import { groceryOrderStatusTranslationKey, groceryPaymentStatusTranslationKey } from "@/utils/groceryUnits";
import PageSpinner from "@/components/ui/PageSpinner";

function SalesBars({ data }: { data: GroceryPartnerSales }) {
  const max = Math.max(...data.sales, 1);
  return (
    <div className="flex h-40 items-end gap-1">
      {data.sales.map((value, index) => (
        <div
          key={data.labels[index]}
          className="flex-1 rounded-t-md bg-[#0B8F45]/80"
          style={{ height: `${Math.max(8, (value / max) * 100)}%` }}
          title={`${data.labels[index]}: ${value}`}
        />
      ))}
    </div>
  );
}

function KpiCard({
  label,
  value,
  change,
  changeLabel,
  icon: Icon,
}: {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: typeof Package;
}) {
  const up = (change ?? 0) >= 0;
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between">
        <p className="text-sm text-[#6B7280]">{label}</p>
        <span className="rounded-xl bg-[#EAF7EE] p-2 text-[#0B8F45]">
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-[#111827]">{value}</p>
      {change !== undefined ? (
        <p className={`mt-1 text-xs font-medium ${up ? "text-[#0B8F45]" : "text-red-600"}`}>
          {up ? "+" : ""}
          {change}% {changeLabel}
        </p>
      ) : null}
    </div>
  );
}

function statusClass(status: string): string {
  if (status === "new") return "bg-blue-50 text-blue-700";
  if (status === "cancelled" || status === "refunded") return "bg-red-50 text-red-700";
  if (status === "delivered") return "bg-emerald-50 text-emerald-700";
  if (status === "ready") return "bg-amber-50 text-amber-800";
  return "bg-slate-100 text-slate-700";
}

export default function GroceryPartnerHome() {
  const { t } = useTranslation();
  const { data, isFetching, isError, refetch } = useGetGroceryPartnerDashboardQuery();
  const sales = useGetGroceryPartnerSalesQuery("7d");

  if (!isError && (isFetching || !data)) {
    return <PageSpinner color="green" />;
  }
  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center">
        <p className="font-medium">{t("gpLoadError")}</p>
        <button type="button" className="mt-3 rounded-full bg-[#0B8F45] px-4 py-2 text-sm text-white" onClick={() => void refetch()}>
          {t("gpTryAgain")}
        </button>
      </div>
    );
  }

  const kpis = data.kpis;
  const money = (n: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: data.low_stock_products[0]?.currency || "ZAR" }).format(n);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">
          {t("gpGreeting", "Good afternoon, {name}", { name: data.greeting_name })}
        </h1>
        <p className="mt-1 text-[#6B7280]">{t("gpGreetingSub")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Link href="/provider/grocery/products/new" className="flex items-center justify-center gap-2 rounded-2xl bg-[#0B8F45] px-4 py-4 text-sm font-semibold text-white shadow-sm hover:bg-[#056B34]">
          <PackagePlus size={18} /> {t("gpAddProduct")}
        </Link>
        <Link href="/provider/grocery/orders" className="flex items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 text-sm font-semibold hover:border-[#0B8F45]">
          <ShoppingBag size={18} /> {t("gpViewOrders")}
        </Link>
        <Link href="/provider/grocery/inventory" className="flex items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 text-sm font-semibold hover:border-[#0B8F45]">
          <Warehouse size={18} /> {t("gpUpdateInventory")}
        </Link>
        <Link href="/provider/grocery/promotions" className="flex items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 text-sm font-semibold hover:border-[#0B8F45]">
          <Percent size={18} /> {t("gpCreatePromotion")}
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard label={t("gpTodaySales")} value={money(kpis.today_sales)} change={kpis.today_sales_change} changeLabel={t("gpVsYesterday")} icon={Wallet} />
        <KpiCard label={t("gpOrdersToday")} value={String(kpis.orders_today)} change={kpis.orders_today_change} changeLabel={t("gpVsYesterday")} icon={ShoppingBag} />
        <KpiCard label={t("gpProductsCount")} value={String(kpis.products)} icon={Package} />
        <KpiCard label={t("gpLowStock")} value={String(kpis.low_stock)} icon={AlertTriangle} />
        <KpiCard label={t("gpPendingOrders")} value={String(kpis.pending_orders)} icon={Clock} />
        <KpiCard label={t("gpRevenueKpi")} value={money(kpis.revenue)} change={kpis.revenue_change} changeLabel={t("gpVsLastMonth")} icon={Wallet} />
      </div>

      {sales.data ? (
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <h2 className="mb-4 font-semibold">{t("gpSales")}</h2>
          <SalesBars data={sales.data} />
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            <div><p className="text-[#6B7280]">{t("gpTodaySales")}</p><p className="font-semibold">{money(sales.data.total_sales)}</p></div>
            <div><p className="text-[#6B7280]">{t("gpOrders")}</p><p className="font-semibold">{sales.data.order_count}</p></div>
            <div><p className="text-[#6B7280]">{t("gpAvgOrder")}</p><p className="font-semibold">{money(sales.data.average_order_value)}</p></div>
            <div><p className="text-[#6B7280]">{t("gpCompletedOrders")}</p><p className="font-semibold">{sales.data.completed_orders}</p></div>
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">{t("gpRecentOrders")}</h2>
          <Link href="/provider/grocery/orders" className="text-sm font-medium text-[#0B8F45]">
            {t("gpViewAllOrders")}
          </Link>
        </div>
        {data.recent_orders.length === 0 ? (
          <p className="text-sm text-[#6B7280]">{t("gpEmptyOrders")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-[#6B7280]">
                <tr>
                  <th className="pb-2 font-medium">{t("gpOrderNumber")}</th>
                  <th className="pb-2 font-medium">{t("gpCustomer")}</th>
                  <th className="pb-2 font-medium">{t("gpItems")}</th>
                  <th className="pb-2 font-medium">{t("gpTotal")}</th>
                  <th className="pb-2 font-medium">{t("gpStatus")}</th>
                  <th className="pb-2 font-medium">{t("gpPayment")}</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_orders.map((order) => (
                  <tr key={order.id} className="border-t border-[#E5E7EB]">
                    <td className="py-3 font-medium">
                      <Link href={`/provider/grocery/orders/${order.id}`} className="text-[#056B34]">
                        {order.number}
                      </Link>
                    </td>
                    <td>{order.customer}</td>
                    <td>{order.items}</td>
                    <td>{money(order.total)}</td>
                    <td>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusClass(order.status)}`}>
                        {t(groceryOrderStatusTranslationKey(order.status))}
                      </span>
                    </td>
                    <td>{t(groceryPaymentStatusTranslationKey(order.payment_status))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="hidden" style={{ color: GROCERY_THEME.primary }} />
    </div>
  );
}
