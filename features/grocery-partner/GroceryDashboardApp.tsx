"use client";

import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/redux/slices/authSlice";
import {
  useGetGroceryDashboardQuery,
  useGetGrocerySalesQuery,
} from "@/redux/slices/groceryPartnerApi";
import GrocerySidebar from "./GrocerySidebar";
import DashboardHome from "./DashboardHome";
import ProductsManager from "./ProductsManager";
import InventoryManager from "./InventoryManager";
import OrdersManager from "./OrdersManager";
import GrocerySections, { GroceryMoreHub } from "./GrocerySections";
import type { GroceryNavKey } from "./types";

const MOBILE_TABS: GroceryNavKey[] = ["dashboard", "orders", "products", "inventory", "more"];
const MORE_VIEWS = new Set<GroceryNavKey>([
  "more",
  "sales",
  "revenue",
  "payouts",
  "analytics",
  "promotions",
  "profile",
  "hours",
  "delivery",
  "staff",
  "settings",
  "support",
]);

export default function GroceryDashboardApp() {
  const [active, setActive] = useState<GroceryNavKey>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [salesRange, setSalesRange] = useState("7d");
  const router = useRouter();
  const dispatch = useDispatch();
  const { data, isLoading, error } = useGetGroceryDashboardQuery();
  const { data: sales } = useGetGrocerySalesQuery(salesRange);

  const errorMessage = useMemo(() => {
    if (!error) return "";
    if ("status" in error && error.status === 404) return "No grocery store is linked to this account.";
    return "Could not load the grocery dashboard.";
  }, [error]);

  function logout() {
    dispatch(logoutUser());
    router.push("/");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden md:block">
        <GrocerySidebar
          active={active}
          collapsed={collapsed}
          storeName={data?.greeting_name}
          logo={data?.store.logo}
          pendingOrders={data?.kpis.pending_orders}
          onSelect={setActive}
          onToggle={() => setCollapsed((value) => !value)}
          onLogout={logout}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 md:hidden">
          <div>
            <p className="text-sm text-slate-500">{greetingNow()}</p>
            <p className="font-semibold">{data?.greeting_name || "Grocery Partner"}</p>
          </div>
          <button type="button" className="text-sm text-rose-600" onClick={logout}>
            Logout
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-8">
          {active === "dashboard" && (
            <DashboardHome
              data={data}
              sales={sales}
              loading={isLoading}
              error={errorMessage}
              salesRange={salesRange}
              onSalesRange={setSalesRange}
              onNavigate={setActive}
            />
          )}
          {active === "products" && <ProductsManager />}
          {active === "inventory" && <InventoryManager />}
          {active === "orders" && <OrdersManager />}
          {active === "more" && <GroceryMoreHub onSelect={setActive} />}
          {active !== "dashboard" &&
            active !== "products" &&
            active !== "inventory" &&
            active !== "orders" &&
            active !== "more" && <GrocerySections view={active} dashboard={data} />}
        </main>
        <nav className="fixed inset-x-0 bottom-0 grid grid-cols-5 border-t bg-white md:hidden">
          {MOBILE_TABS.map((tab) => {
            const selected = tab === "more" ? MORE_VIEWS.has(active) : active === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActive(tab)}
                className={`py-3 text-xs font-semibold ${selected ? "text-emerald-700" : "text-slate-500"}`}
              >
                {tab[0].toUpperCase() + tab.slice(1)}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function greetingNow() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
