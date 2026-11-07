"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Warehouse,
  Tags,
  Percent,
  Users,
  Star,
  LineChart,
  Wallet,
  Banknote,
  BarChart3,
  Store,
  Clock,
  Truck,
  UserCog,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  Bell,
  Menu,
} from "lucide-react";
import withPartnerAuth from "@/components/PartnerRouteGuard";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { logoutUser, selectUser } from "@/redux/slices/authSlice";
import { GROCERY_THEME } from "@/features/groceries/theme";
import { initLanguage } from "@/configs/i18n";
import { supportedLocales, type SupportedLocale } from "@/configs/translations";
import { useGetGroceryPartnerNotificationsQuery } from "./groceryPartnerApi";
import {
  isGroceryPartnerUser,
  isRestaurantPartnerUser,
  RESTAURANT_DASHBOARD_PATH,
} from "@/utils/partnerDashboardKind";

const LANGUAGES: { value: SupportedLocale; label: string; flag: string }[] = [
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "pt", label: "Português", flag: "🇵🇹" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "es", label: "Español", flag: "🇪🇸" },
];

type NavItem = { href: string; key: string; icon: typeof LayoutDashboard };

const MAIN: NavItem[] = [
  { href: "/provider/grocery", key: "gpDashboard", icon: LayoutDashboard },
  { href: "/provider/grocery/orders", key: "gpOrders", icon: ShoppingBag },
  { href: "/provider/grocery/products", key: "gpProducts", icon: Package },
  { href: "/provider/grocery/inventory", key: "gpInventory", icon: Warehouse },
  { href: "/provider/grocery/categories", key: "gpCategories", icon: Tags },
  { href: "/provider/grocery/promotions", key: "gpPromotions", icon: Percent },
  { href: "/provider/grocery/customers", key: "gpCustomers", icon: Users },
  { href: "/provider/grocery/reviews", key: "gpReviews", icon: Star },
];

const BUSINESS: NavItem[] = [
  { href: "/provider/grocery/sales", key: "gpSales", icon: LineChart },
  { href: "/provider/grocery/revenue", key: "gpRevenue", icon: Wallet },
  { href: "/provider/grocery/payouts", key: "gpPayouts", icon: Banknote },
  { href: "/provider/grocery/analytics", key: "gpAnalytics", icon: BarChart3 },
];

const STORE: NavItem[] = [
  { href: "/provider/grocery/store", key: "gpStoreProfile", icon: Store },
  { href: "/provider/grocery/hours", key: "gpOpeningHours", icon: Clock },
  { href: "/provider/grocery/delivery", key: "gpDeliverySettings", icon: Truck },
  { href: "/provider/grocery/staff", key: "gpStaff", icon: UserCog },
  { href: "/provider/grocery/settings", key: "gpSettings", icon: Settings },
];

function NavGroup({
  title,
  items,
  collapsed,
  pathname,
  t,
}: {
  title: string;
  items: NavItem[];
  collapsed: boolean;
  pathname: string;
  t: (key: string, fallback?: string) => string;
}) {
  return (
    <div className="mb-4">
      {!collapsed ? (
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/50">
          {title}
        </p>
      ) : null}
      {items.map((item) => {
        const active =
          item.href === "/provider/grocery"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={t(item.key)}
            className={`mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active ? "bg-white text-[#056B34]" : "text-white/85 hover:bg-white/10"
            } ${collapsed ? "justify-center px-2" : ""}`}
          >
            <Icon size={18} />
            {collapsed ? null : <span>{t(item.key)}</span>}
          </Link>
        );
      })}
    </div>
  );
}

function GroceryPartnerShell({ children }: { children: React.ReactNode }) {
  const { t, languageCode, changeLanguage } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: notes } = useGetGroceryPartnerNotificationsQuery(undefined, {
    skip: Boolean(user && isRestaurantPartnerUser(user) && !isGroceryPartnerUser(user)),
  });

  useEffect(() => {
    if (user && isRestaurantPartnerUser(user) && !isGroceryPartnerUser(user)) {
      router.replace(RESTAURANT_DASHBOARD_PATH);
    }
  }, [router, user]);

  function logout() {
    dispatch(logoutUser());
    router.replace("/LoginScreenUser");
  }

  if (user && isRestaurantPartnerUser(user) && !isGroceryPartnerUser(user)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        {t("loading", "Loading...")}
      </div>
    );
  }

  const sidebar = (
    <aside
      className={`flex h-full flex-col bg-[#056B34] text-white transition-all ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between px-3 py-4">
        {collapsed ? (
          <span className="mx-auto text-lg font-bold">K</span>
        ) : (
          <span className="text-lg font-bold tracking-tight">{t("gpBrandTitle")}</span>
        )}
        <button
          type="button"
          className="hidden rounded-lg p-1 hover:bg-white/10 lg:block"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? t("gpExpandSidebar") : t("gpCollapseSidebar")}
        >
          <ChevronLeft className={`h-4 w-4 transition ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        <NavGroup title={t("gpMain")} items={MAIN} collapsed={collapsed} pathname={pathname} t={t} />
        <NavGroup title={t("gpBusiness")} items={BUSINESS} collapsed={collapsed} pathname={pathname} t={t} />
        <NavGroup title={t("gpStore")} items={STORE} collapsed={collapsed} pathname={pathname} t={t} />
      </nav>
      <div className="border-t border-white/10 px-2 py-3">
        <Link
          href="/provider/grocery/help"
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/85 hover:bg-white/10 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <HelpCircle size={18} />
          {collapsed ? null : t("gpHelp")}
        </Link>
        <button
          type="button"
          onClick={logout}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/85 hover:bg-white/10 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={18} />
          {collapsed ? null : t("gpLogout")}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAF9]" style={{ color: GROCERY_THEME.text }}>
      <div className="hidden lg:block">{sidebar}</div>
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label={t("gpCloseMenu")}
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50 h-full w-64">{sidebar}</div>
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[#E5E7EB] bg-white px-4 py-3">
          <button
            type="button"
            className="rounded-lg p-2 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label={t("gpOpenMenu")}
          >
            <Menu size={20} />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <label className="sr-only" htmlFor="grocery-partner-language">
              {t("changeLanguage")}
            </label>
            <select
              id="grocery-partner-language"
              className="rounded-xl border border-[#E5E7EB] bg-white px-2 py-1.5 text-sm font-medium text-[#111827] outline-none focus:border-[#0B8F45] focus:ring-2 focus:ring-[#0B8F45]/20"
              value={languageCode}
              onChange={(event) => {
                const next = event.target.value as SupportedLocale;
                initLanguage(next);
                changeLanguage(next);
              }}
              aria-label={t("changeLanguage")}
            >
              {LANGUAGES.filter((opt) => supportedLocales.includes(opt.value)).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.flag} {opt.label}
                </option>
              ))}
            </select>
            <span className="relative rounded-full bg-[#EAF7EE] p-2 text-[#056B34]" title={t("gpNotifications")}>
              <Bell size={18} />
              {notes && notes.count > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0B8F45] px-1 text-[10px] font-bold text-white">
                  {notes.count}
                </span>
              ) : null}
            </span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

export default withPartnerAuth(GroceryPartnerShell);
