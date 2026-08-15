import type { AdminPanelId } from "@/app/AdminDashboard/adminPanels";

/** Shared visual tokens for the platform admin console. */
export const adminUi = {
  shell:
    "min-h-screen bg-[#f4f6f9] bg-[radial-gradient(1200px_600px_at_0%_-10%,rgba(37,99,235,0.08),transparent_55%),radial-gradient(900px_500px_at_100%_0%,rgba(14,165,233,0.06),transparent_50%)]",
  content: "mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-6",
  card: "rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)]",
  cardHover:
    "rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06),0_16px_32px_-16px_rgba(37,99,235,0.18)]",
  sectionTitle: "text-base font-semibold tracking-tight text-slate-900 sm:text-lg",
  sectionSub: "mt-1 text-sm leading-relaxed text-slate-500",
  kpiLabel: "text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500",
  kpiValue: "mt-1.5 text-2xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-[1.75rem]",
  chip: "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
  btnPrimary:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900",
  btnAccent:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
  btnGhost:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50",
  input:
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10",
  panelSurface: "rounded-2xl border border-slate-200/90 bg-white/80 p-4 shadow-sm sm:p-5",
} as const;

export type AdminNavGroupId = "overview" | "operations" | "people" | "trust" | "platform" | "system";

export type AdminNavItemMeta = {
  key: AdminPanelId;
  group: AdminNavGroupId;
  labelKey: string;
  labelDefault: string;
  descKey: string;
  descDefault: string;
};

export const ADMIN_NAV_ITEMS: AdminNavItemMeta[] = [
  {
    key: "superApp",
    group: "overview",
    labelKey: "superApp",
    labelDefault: "Overview",
    descKey: "platformOverview",
    descDefault: "Live platform metrics across food, rides, and deliveries",
  },
  {
    key: "orders",
    group: "operations",
    labelKey: "orders",
    labelDefault: "Orders",
    descKey: "ordersAdminDesc",
    descDefault: "Monitor and manage customer orders",
  },
  {
    key: "stores",
    group: "operations",
    labelKey: "stores",
    labelDefault: "Stores",
    descKey: "storesAdminDesc",
    descDefault: "Partner stores and restaurant accounts",
  },
  {
    key: "menus",
    group: "operations",
    labelKey: "menus",
    labelDefault: "Menus",
    descKey: "menusAdminDesc",
    descDefault: "Catalog and product listings",
  },
  {
    key: "reports",
    group: "operations",
    labelKey: "reports",
    labelDefault: "Reports",
    descKey: "reportsAdminDesc",
    descDefault: "Performance and revenue insights",
  },
  {
    key: "payouts",
    group: "operations",
    labelKey: "payouts",
    labelDefault: "Payouts",
    descKey: "payoutsAdminDesc",
    descDefault: "Partner and driver settlements",
  },
  {
    key: "customers",
    group: "people",
    labelKey: "customers",
    labelDefault: "Customers",
    descKey: "customersAdminDesc",
    descDefault: "Customer accounts and activity",
  },
  {
    key: "drivers",
    group: "people",
    labelKey: "drivers",
    labelDefault: "Drivers",
    descKey: "driversAdminDesc",
    descDefault: "Fleet operations and live status",
  },
  {
    key: "partners",
    group: "people",
    labelKey: "partners",
    labelDefault: "Partners",
    descKey: "partnersAdminDesc",
    descDefault: "Business partner accounts",
  },
  {
    key: "liveSupport",
    group: "people",
    labelKey: "liveSupport",
    labelDefault: "Live support",
    descKey: "liveSupportAdminDesc",
    descDefault: "Active support conversations",
  },
  {
    key: "kyc",
    group: "trust",
    labelKey: "kyc",
    labelDefault: "KYC",
    descKey: "kycAdminDesc",
    descDefault: "Identity verification queue",
  },
  {
    key: "doctorVerification",
    group: "trust",
    labelKey: "doctorVerification",
    labelDefault: "Doctor verification",
    descKey: "doctorVerificationAdminDesc",
    descDefault: "Review doctor credentials",
  },
  {
    key: "driverVerification",
    group: "trust",
    labelKey: "driverVerification",
    labelDefault: "Driver verification",
    descKey: "driverVerificationAdminDesc",
    descDefault: "Review driver documents",
  },
  {
    key: "propertyReview",
    group: "trust",
    labelKey: "propertyReview",
    labelDefault: "Property review",
    descKey: "propertyReviewAdminDesc",
    descDefault: "Approve or suspend property listings",
  },
  {
    key: "propertyApplications",
    group: "trust",
    labelKey: "propertyApplicationsAdmin",
    labelDefault: "Property applications",
    descKey: "propertyApplicationsAdminDesc",
    descDefault: "Overview rental applications and unblock stuck documents",
  },
  {
    key: "platformControl",
    group: "platform",
    labelKey: "platformServices",
    labelDefault: "Services",
    descKey: "platformServicesAdminDesc",
    descDefault: "Enable and configure platform modules",
  },
  {
    key: "pricing",
    group: "platform",
    labelKey: "pricingAndFees",
    labelDefault: "Pricing & fees",
    descKey: "pricingAdminDesc",
    descDefault: "Fees, commissions, and pricing rules",
  },
  {
    key: "verticalOps",
    group: "operations",
    labelKey: "verticalOps",
    labelDefault: "Stay / rental / packages",
    descKey: "verticalOpsDesc",
    descDefault: "Staff queues for stay bookings, car rentals, and packages",
  },
  {
    key: "translations",
    group: "platform",
    labelKey: "translationsAdmin",
    labelDefault: "Translations",
    descKey: "translationsAdminDesc",
    descDefault: "Manage locale strings",
  },
  {
    key: "backupExport",
    group: "system",
    labelKey: "backupExport",
    labelDefault: "Backup & export",
    descKey: "backupExportAdminDesc",
    descDefault: "Data backup and export tools",
  },
];

export const ADMIN_NAV_GROUPS: { id: AdminNavGroupId; labelKey: string; labelDefault: string }[] = [
  { id: "overview", labelKey: "overview", labelDefault: "Overview" },
  { id: "operations", labelKey: "operations", labelDefault: "Operations" },
  { id: "people", labelKey: "people", labelDefault: "People" },
  { id: "trust", labelKey: "trustSafety", labelDefault: "Trust & safety" },
  { id: "platform", labelKey: "platformSettings", labelDefault: "Platform" },
  { id: "system", labelKey: "systemManagement", labelDefault: "System" },
];

export function getAdminPanelMeta(panel: AdminPanelId): AdminNavItemMeta {
  return ADMIN_NAV_ITEMS.find((item) => item.key === panel) ?? ADMIN_NAV_ITEMS[0];
}
