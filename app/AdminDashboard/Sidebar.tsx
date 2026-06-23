// app/AdminDashboard/Sidebar.tsx
import React from "react";
import { MdClose, MdContacts, MdBarChart, MdTableBar, MdLogout, MdLaptop, MdSettingsBackupRestore, MdTune, MdAttachMoney, MdTranslate } from "react-icons/md";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useTranslation } from "@/hooks/useTranslation";
import { supportedLocales } from "@/configs/translations";
import { logoutUser } from "@/redux/slices/authSlice";
import type { AdminPanelId } from "./adminPanels";

type SidebarProps = {
  isOpen: boolean;
  onToggle: () => void;
  activePanel: AdminPanelId;
  onSelectPanel: (panel: AdminPanelId) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, activePanel, onSelectPanel }) => {
  const { t, languageCode, changeLanguage } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push("/LoginScreenUser");
  };

  const openPanel = (panel: AdminPanelId) => {
    onSelectPanel(panel);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      onToggle();
    }
  };

  type MenuItem = {
    key: AdminPanelId;
    label: string;
    icon: React.ReactNode;
  };

  const dashboardItems: MenuItem[] = [
    { key: "superApp", label: t("superApp", "Super App"), icon: <MdBarChart className="text-lg" /> },
    { key: "stores", label: t("stores", "Stores"), icon: <MdContacts className="text-lg" /> },
    { key: "menus", label: t("menus", "Menus"), icon: <MdLaptop className="text-lg" /> },
    { key: "orders", label: t("orders", "Orders"), icon: <MdLaptop className="text-lg" /> },
    { key: "reports", label: t("reports", "Reports"), icon: <MdBarChart className="text-lg" /> },
    { key: "customers", label: t("customers", "Customers"), icon: <MdTableBar className="text-lg" /> },
    { key: "drivers", label: t("drivers", "Drivers"), icon: <MdBarChart className="text-lg" /> },
    { key: "partners", label: t("partners", "Partners"), icon: <MdContacts className="text-lg" /> },
    { key: "kyc", label: t("kyc", "KYC"), icon: <MdBarChart className="text-lg" /> },
    { key: "doctorVerification", label: t("doctorVerification", "Doctor verification"), icon: <MdBarChart className="text-lg" /> },
    { key: "liveSupport", label: t("liveSupport", "Live support"), icon: <MdContacts className="text-lg" /> },
    { key: "payouts", label: t("payouts", "Payouts"), icon: <MdBarChart className="text-lg" /> },
  ];

  const platformItems: MenuItem[] = [
    { key: "platformControl", label: t("platformControl", "Platform control"), icon: <MdTune className="text-lg" /> },
    { key: "pricing", label: t("pricingAndFees", "Pricing & fees"), icon: <MdAttachMoney className="text-lg" /> },
    { key: "translations", label: t("translationsAdmin", "Translations"), icon: <MdTranslate className="text-lg" /> },
  ];

  const systemItems: MenuItem[] = [
    { key: "backupExport", label: t("backupExport", "Backup & Export"), icon: <MdSettingsBackupRestore className="text-lg" /> },
  ];

  const renderMenuItem = (item: MenuItem) => (
    <li key={item.key}>
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full p-2 rounded hover:bg-blue-600 cursor-pointer text-left ${activePanel === item.key ? "bg-blue-700" : ""}`}
        onClick={() => openPanel(item.key)}
        aria-current={activePanel === item.key ? "page" : undefined}
      >
        <div className="flex items-center space-x-3">
          {item.icon}
          <span>{item.label}</span>
        </div>
      </motion.button>
    </li>
  );

  return (
    <div className={`fixed inset-y-0 left-0 z-40 md:relative md:flex md:h-full ${isOpen ? "flex" : "hidden"}`}>
      <nav className="w-64 h-full bg-blue-500 text-white p-4 flex flex-col shrink-0">
        <button onClick={onToggle} className="md:hidden text-2xl text-white mb-4 self-end">
          <MdClose />
        </button>
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative w-12 h-12">
              <Image
                src="https://www.kudya.shop/media/logo/azul.png"
                width={500}
                height={300}
                className="rounded-full"
                alt={t("supplierLogo", "Supplier Logo")}
              />
              <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-400 rounded-full"></span>
            </div>
            <div>
              <h5 className="font-semibold">{t("administrator", "Administrator")}</h5>
              <span>{t("administrator", "Administrator")}</span>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ul className="space-y-4">
            <li className="text-xs font-semibold tracking-wide uppercase">{t("dashboard", "Dashboard")}</li>
            {dashboardItems.map(renderMenuItem)}
            <li className="text-xs font-semibold tracking-wide uppercase mt-6">{t("platformSettings", "Platform")}</li>
            {platformItems.map(renderMenuItem)}
            <li className="text-xs font-semibold tracking-wide uppercase mt-6">{t("systemManagement", "System Management")}</li>
            {systemItems.map(renderMenuItem)}
          </ul>
        </div>
        <div className="mt-6 space-y-3">
          <label className="hidden md:block text-xs text-blue-100">
            {t("language", "Language")}
            <select
              className="mt-1 w-full rounded border-0 px-2 py-1 text-sm text-slate-800"
              value={languageCode}
              onChange={(e) => changeLanguage(e.target.value as typeof languageCode)}
            >
              {supportedLocales.map((loc) => (
                <option key={loc} value={loc}>
                  {loc.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full list-none p-2 mt-4 rounded hover:bg-red-500 cursor-pointer text-left"
            onClick={handleLogout}
          >
            <div className="flex items-center space-x-3 text-red-200">
              <MdLogout className="text-lg" />
              <span>{t("logout", "Logout")}</span>
            </div>
          </motion.button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
