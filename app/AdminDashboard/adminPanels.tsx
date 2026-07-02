"use client";

import dynamic from "next/dynamic";

const SuperAppAdmin = dynamic(() => import("@/components/SuperAppAdmin"));
const PlatformModulesAdmin = dynamic(() => import("@/components/admin/PlatformModulesAdmin"));
const PricingAdmin = dynamic(() => import("@/components/admin/PricingAdmin"));
const TranslationsAdmin = dynamic(() => import("@/components/admin/TranslationsAdmin"));
const ProductList = dynamic(() => import("./store/ProductList"));
const Orders = dynamic(() => import("./Orders"));
const Store = dynamic(() => import("./Store"));
const Report = dynamic(() => import("./Report"));
const CustomersList = dynamic(() => import("./CustomersList"));
const GlobalDriverOperationsDashboard = dynamic(
  () => import("@/features/admin/drivers/GlobalDriverOperationsDashboard"),
);
const DriverList = dynamic(() => import("./DriverList"));
const KYC = dynamic(() => import("./KYC"));
const DoctorVerificationAdmin = dynamic(() => import("@/components/admin/DoctorVerificationAdmin"));
const DriverVerificationAdmin = dynamic(() => import("@/components/admin/DriverVerificationAdmin"));
const LiveSupportAdmin = dynamic(() => import("@/components/admin/LiveSupportAdmin"));
const Payouts = dynamic(() => import("./Payouts"));
const DatabaseActions = dynamic(() => import("./DatabaseActions"));
const BackupExport = dynamic(() => import("@/components/BackupExport"));

export type AdminPanelId =
  | "superApp"
  | "stores"
  | "menus"
  | "orders"
  | "reports"
  | "customers"
  | "drivers"
  | "partners"
  | "kyc"
  | "doctorVerification"
  | "driverVerification"
  | "liveSupport"
  | "payouts"
  | "platformControl"
  | "pricing"
  | "translations"
  | "backupExport";

export function AdminPanelContent({ activePanel }: { activePanel: AdminPanelId }) {
  switch (activePanel) {
    case "superApp":
      return <SuperAppAdmin />;
    case "platformControl":
      return <PlatformModulesAdmin />;
    case "pricing":
      return <PricingAdmin />;
    case "translations":
      return <TranslationsAdmin />;
    case "menus":
      return <ProductList />;
    case "orders":
      return <Orders />;
    case "stores":
    case "partners":
      return <Store />;
    case "reports":
      return <Report />;
    case "customers":
      return <CustomersList />;
    case "drivers":
      return <GlobalDriverOperationsDashboard />;
    case "kyc":
      return <KYC />;
    case "doctorVerification":
      return <DoctorVerificationAdmin />;
    case "driverVerification":
      return <DriverVerificationAdmin />;
    case "liveSupport":
      return <LiveSupportAdmin />;
    case "payouts":
      return <Payouts />;
    case "backupExport":
      return <BackupExport />;
    default:
      return <SuperAppAdmin />;
  }
}
