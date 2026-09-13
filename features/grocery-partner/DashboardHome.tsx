"use client";

import dynamic from "next/dynamic";
import { Boxes, Package, ShoppingBag, TriangleAlert, Wallet, Plus } from "lucide-react";
import type { GroceryDashboardData, GroceryNavKey, GrocerySalesData } from "./types";
import { formatChange, formatMoney, greetingForNow, groceryStatusLabel, inventoryLabel } from "./format";
import { EmptyState, Panel, SkeletonCard, StatusBadge } from "./ui";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Props = {
  data?: GroceryDashboardData;
  sales?: GrocerySalesData;
  loading: boolean;
  error?: string;
  salesRange: string;
  onSalesRange: (value: string) => void;
  onNavigate: (key: GroceryNavKey) => void;
};

const RANGES = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "3m", label: "3 Months" },
  { id: "12m", label: "12 Months" },
];

export default function DashboardHome({
  data,
  sales,
  loading,
  error,
  salesRange,
  onSalesRange,
  onNavigate,
}: Props) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }
  if (error) {
    return <EmptyState title="Could not load dashboard" body={error} />;
  }
  if (!data) {
    return <EmptyState title="No store data yet" body="Your grocery KPIs will appear here once the store is ready." />;
  }

  const kpis = [
    { label: "Today's Sales", value: formatMoney(data.kpis.sales_today), change: data.kpis.sales_today_change, icon: Wallet },
    { label: "Orders Today", value: String(data.kpis.orders_today), change: data.kpis.orders_today_change, icon: ShoppingBag },
    { label: "Products", value: String(data.kpis.products), icon: Package },
    { label: "Low Stock", value: String(data.kpis.low_stock), icon: TriangleAlert, warn: data.kpis.low_stock > 0 },
    { label: "Pending Orders", value: String(data.kpis.pending_orders), icon: ShoppingBag },
    { label: "Revenue", value: formatMoney(data.kpis.revenue), icon: Boxes },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {greetingForNow()}, {data.greeting_name}
        </h1>
        <p className="text-sm text-slate-500">Here is what is happening with your store today.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "+ Add Product", key: "products" as const },
          { label: "View Orders", key: "orders" as const },
          { label: "Update Inventory", key: "inventory" as const },
          { label: "Create Promotion", key: "promotions" as const },
        ].map((action) => (
          <button
            key={action.key}
            type="button"
            onClick={() => onNavigate(action.key)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            <Plus size={16} />
            {action.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{kpi.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{kpi.value}</p>
                  {kpi.change !== undefined && (
                    <p className={`mt-1 text-xs ${kpi.change >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {formatChange(kpi.change)}
                    </p>
                  )}
                </div>
                <div className={`rounded-xl p-2 ${kpi.warn ? "bg-amber-100 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                  <Icon size={18} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Panel
        title="Sales overview"
        action={
          <div className="flex flex-wrap gap-2">
            {RANGES.map((range) => (
              <button
                key={range.id}
                type="button"
                onClick={() => onSalesRange(range.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  salesRange === range.id ? "bg-emerald-700 text-white" : "border border-slate-200 text-slate-600"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        }
      >
        {sales ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-4">
              <MiniStat label="Total sales" value={formatMoney(sales.summary.total_sales)} />
              <MiniStat label="Orders" value={String(sales.summary.orders)} />
              <MiniStat label="Average order" value={formatMoney(sales.summary.average_order_value)} />
              <MiniStat label="Completed" value={String(sales.summary.completed_orders)} />
            </div>
            <Chart
              type="area"
              height={280}
              series={[{ name: "Sales", data: sales.sales }]}
              options={{
                chart: { toolbar: { show: false }, zoom: { enabled: false } },
                colors: ["#059669"],
                dataLabels: { enabled: false },
                stroke: { curve: "smooth", width: 3 },
                xaxis: { categories: sales.labels },
                yaxis: { labels: { formatter: (value: number) => formatMoney(value) } },
                grid: { borderColor: "#e2e8f0" },
              }}
            />
          </div>
        ) : (
          <EmptyState title="No sales yet" body="Completed grocery orders will appear in this chart." />
        )}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Recent Orders"
          action={
            <button type="button" className="text-sm font-semibold text-emerald-700" onClick={() => onNavigate("orders")}>
              View All Orders
            </button>
          }
        >
          {data.recent_orders.length === 0 ? (
            <EmptyState title="No orders yet" body="New grocery orders will show up here." />
          ) : (
            <div className="space-y-3">
              {data.recent_orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-3">
                  <div>
                    <p className="font-semibold text-slate-900">#KDY-{order.id}</p>
                    <p className="text-xs text-slate-500">
                      {order.customer?.name || "Customer"} · {order.order_details?.length || 0} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatMoney(order.total)}</p>
                    <StatusBadge label={groceryStatusLabel(order.grocery_status || order.status)} tone="info" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
        <Panel title="Low stock" action={<button type="button" className="text-sm font-semibold text-emerald-700" onClick={() => onNavigate("inventory")}>Update Stock</button>}>
          {data.low_stock_products.length === 0 ? (
            <EmptyState title="Stock looks healthy" body="Products below their threshold will appear here." />
          ) : (
            <div className="space-y-3">
              {data.low_stock_products.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-xl bg-amber-50 px-3 py-3">
                  <div>
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="text-xs text-amber-800">
                      {product.stock_quantity} {product.stock_unit} remaining
                    </p>
                  </div>
                  <StatusBadge label={inventoryLabel(product.inventory_status)} tone="warning" />
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}
