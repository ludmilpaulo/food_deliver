// app/AdminDashboard/Sidebar.tsx
import React, { useState } from "react";
import { MdClose, MdContacts, MdBarChart, MdTableBar, MdLogout, MdLaptop, MdSettingsBackupRestore, MdTune, MdAttachMoney, MdTranslate } from "react-icons/md";
import { motion } from "framer-motion";
import { Transition } from "@headlessui/react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useTranslation } from "@/hooks/useTranslation";
import { supportedLocales } from "@/configs/translations";
import { logoutUser } from "@/redux/slices/authSlice";

const CustomersList = dynamic(() => import("./CustomersList"));

const Report = dynamic(() => import("./Report"));
const KYC = dynamic(() => import("./KYC"));
const Payouts = dynamic(() => import("./Payouts"));
const DriverList = dynamic(() => import("./DriverList"));
const Orders = dynamic(() => import("./Orders"));
const Store = dynamic(() => import("./Store"));
const ProductList = dynamic(() => import("./store/ProductList"));
const DatabaseActions = dynamic(() => import("./DatabaseActions"));
const SuperAppAdmin = dynamic(() => import("@/components/SuperAppAdmin"));
const BackupExport = dynamic(() => import("@/components/BackupExport"));
const PlatformModulesAdmin = dynamic(() => import("@/components/admin/PlatformModulesAdmin"));
const PricingAdmin = dynamic(() => import("@/components/admin/PricingAdmin"));
const TranslationsAdmin = dynamic(() => import("@/components/admin/TranslationsAdmin"));
const DoctorVerificationAdmin = dynamic(() => import("@/components/admin/DoctorVerificationAdmin"));
const LiveSupportAdmin = dynamic(() => import("@/components/admin/LiveSupportAdmin"));

const Sidebar: React.FC<{ isOpen: boolean; onToggle: () => void }> = ({ isOpen, onToggle }) => {
  const { t, languageCode, changeLanguage } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  const [showProducts, setShowProducts] = useState(false);
  const [showproducts, setShowproducts] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showstore, setShowstore] = useState(false);
  const [storeView, setStoreView] = useState<"stores" | "partners">("stores");
  const [showReport, setShowReport] = useState(false);
  const [listOfCustomer, setListOfCustomer] = useState(false);
  const [listOfDriver, setListOfDriver] = useState(false);
  const [showDatabaseActions, setShowDatabaseActions] = useState(false);
  const [showKYC, setShowKYC] = useState(false);
  const [showPayouts, setShowPayouts] = useState(false);
  const [showSuperApp, setShowSuperApp] = useState(true);
  const [showBackupExport, setShowBackupExport] = useState(false);
  const [showPlatformControl, setShowPlatformControl] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showTranslations, setShowTranslations] = useState(false);
  const [showDoctorVerification, setShowDoctorVerification] = useState(false);
  const [showLiveSupport, setShowLiveSupport] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetPanels = () => {
    setShowSuperApp(false);
    setShowProducts(false);
    setShowOrders(false);
    setShowstore(false);
    setShowReport(false);
    setListOfCustomer(false);
    setListOfDriver(false);
    setShowproducts(false);
    setShowKYC(false);
    setShowPayouts(false);
    setShowDatabaseActions(false);
    setShowBackupExport(false);
    setShowPlatformControl(false);
    setShowPricing(false);
    setShowTranslations(false);
    setShowDoctorVerification(false);
    setShowLiveSupport(false);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push("/LoginScreenUser");
  };

  const openPanel = (panel: () => void) => {
    resetPanels();
    panel();
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      onToggle();
    }
  };

  type MenuItem = {
    key: string;
    label: string;
    icon: React.ReactNode;
    active: boolean;
    onSelect: () => void;
  };

  const dashboardItems: MenuItem[] = [
    {
      key: "superApp",
      label: t("superApp", "Super App"),
      icon: <MdBarChart className="text-lg" />,
      active: showSuperApp,
      onSelect: () => setShowSuperApp(true),
    },
    {
      key: "stores",
      label: t("stores", "Stores"),
      icon: <MdContacts className="text-lg" />,
      active: showstore && storeView === "stores",
      onSelect: () => {
        setStoreView("stores");
        setShowstore(true);
      },
    },
    {
      key: "menus",
      label: t("menus", "Menus"),
      icon: <MdLaptop className="text-lg" />,
      active: showproducts,
      onSelect: () => setShowproducts(true),
    },
    {
      key: "orders",
      label: t("orders", "Orders"),
      icon: <MdLaptop className="text-lg" />,
      active: showOrders,
      onSelect: () => setShowOrders(true),
    },
    {
      key: "reports",
      label: t("reports", "Reports"),
      icon: <MdBarChart className="text-lg" />,
      active: showReport,
      onSelect: () => setShowReport(true),
    },
    {
      key: "customers",
      label: t("customers", "Customers"),
      icon: <MdTableBar className="text-lg" />,
      active: listOfCustomer,
      onSelect: () => setListOfCustomer(true),
    },
    {
      key: "drivers",
      label: t("drivers", "Drivers"),
      icon: <MdBarChart className="text-lg" />,
      active: listOfDriver,
      onSelect: () => setListOfDriver(true),
    },
    {
      key: "partners",
      label: t("partners", "Partners"),
      icon: <MdContacts className="text-lg" />,
      active: showstore && storeView === "partners",
      onSelect: () => {
        setStoreView("partners");
        setShowstore(true);
      },
    },
    {
      key: "kyc",
      label: t("kyc", "KYC"),
      icon: <MdBarChart className="text-lg" />,
      active: showKYC,
      onSelect: () => setShowKYC(true),
    },
    {
      key: "doctorVerification",
      label: t("doctorVerification", "Doctor verification"),
      icon: <MdBarChart className="text-lg" />,
      active: showDoctorVerification,
      onSelect: () => setShowDoctorVerification(true),
    },
    {
      key: "liveSupport",
      label: t("liveSupport", "Live support"),
      icon: <MdContacts className="text-lg" />,
      active: showLiveSupport,
      onSelect: () => setShowLiveSupport(true),
    },
    {
      key: "payouts",
      label: t("payouts", "Payouts"),
      icon: <MdBarChart className="text-lg" />,
      active: showPayouts,
      onSelect: () => setShowPayouts(true),
    },
  ];

  const platformItems: MenuItem[] = [
    {
      key: "platformControl",
      label: t("platformControl", "Platform control"),
      icon: <MdTune className="text-lg" />,
      active: showPlatformControl,
      onSelect: () => setShowPlatformControl(true),
    },
    {
      key: "pricing",
      label: t("pricingAndFees", "Pricing & fees"),
      icon: <MdAttachMoney className="text-lg" />,
      active: showPricing,
      onSelect: () => setShowPricing(true),
    },
    {
      key: "translations",
      label: t("translationsAdmin", "Translations"),
      icon: <MdTranslate className="text-lg" />,
      active: showTranslations,
      onSelect: () => setShowTranslations(true),
    },
  ];

  const systemItems: MenuItem[] = [
    {
      key: "backupExport",
      label: t("backupExport", "Backup & Export"),
      icon: <MdSettingsBackupRestore className="text-lg" />,
      active: showBackupExport,
      onSelect: () => setShowBackupExport(true),
    },
  ];

  const renderMenuItem = (item: MenuItem) => (
    <li key={item.key}>
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full p-2 rounded hover:bg-blue-600 cursor-pointer text-left ${item.active ? "bg-blue-700" : ""}`}
        onClick={() => openPanel(item.onSelect)}
        aria-current={item.active ? "page" : undefined}
      >
        <div className="flex items-center space-x-3">
          {item.icon}
          <span>{item.label}</span>
        </div>
      </motion.button>
    </li>
  );

  return (
    <>
      <Transition
        show={loading}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
        </div>
      </Transition>
      <div className="flex h-full">
        <div className={`fixed inset-0 z-40 md:relative md:z-auto md:flex ${isOpen ? "flex" : "hidden"} h-full`}>
          <nav className="w-64 h-full bg-blue-500 text-white p-4 flex flex-col">
            <button onClick={onToggle} className="md:hidden text-2xl text-white mb-4 self-end">
              <MdClose />
            </button>
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative w-12 h-12">
                  <Image
                    src="https://www.kudya.shop/media/logo/azul.png" // Replace with actual logo URL
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
        <div className="flex-1 overflow-y-auto bg-gray-100">
          {showSuperApp && <SuperAppAdmin />}
          {showPlatformControl && <PlatformModulesAdmin />}
          {showPricing && <PricingAdmin />}
          {showTranslations && <TranslationsAdmin />}
          {showproducts && <ProductList />}
          {showOrders && <Orders />}
          {showstore && <Store />}
          {showReport && <Report />}
          {listOfCustomer && <CustomersList />}
          {listOfDriver && <DriverList />}
          {showKYC && <KYC />}
          {showDoctorVerification && <DoctorVerificationAdmin />}
          {showLiveSupport && <LiveSupportAdmin />}
          {showPayouts && <Payouts />}
          {showDatabaseActions && <DatabaseActions />}
          {showBackupExport && <BackupExport />}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
