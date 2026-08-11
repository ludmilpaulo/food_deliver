"use client";

import React, { useMemo } from "react";
import {
  FaTruck,
  FaUserEdit,
  FaHistory,
  FaFileInvoice,
  FaSignOutAlt,
  FaUserSlash,
  FaHome,
  FaFolderOpen,
  FaKey,
  FaBed,
  FaBell,
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logoutUser } from "@/redux/slices/authSlice";
import { clearAllCart } from "@/redux/slices/basketSlice";
import { useTranslation } from "@/hooks/useTranslation";
import type { PropertyServicesSummary } from "@/types/propertyApplication";

interface SidebarProps {
  selectedMenu: string;
  setSelectedMenu: React.Dispatch<React.SetStateAction<string>>;
  onDeactivate?: () => void;
  services?: PropertyServicesSummary | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedMenu,
  setSelectedMenu,
  onDeactivate,
  services = null,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();

  const menuItems = useMemo(() => {
    const base: Array<{
      key: string;
      icon: React.ReactNode;
      labelKey: string;
      fallback: string;
      badge?: number;
      danger?: boolean;
    }> = [
      {
        key: "trackOrders",
        icon: <FaTruck size={18} />,
        labelKey: "trackOrders",
        fallback: "Track Orders",
      },
    ];
    // Property hub is activity-driven: only show when the user has related data.
    if ((services?.property_applications ?? 0) > 0 || services?.modules?.properties) {
      base.push({
        key: "properties",
        icon: <FaHome size={18} />,
        labelKey: "propertyApplications",
        fallback: "Properties",
        badge: services?.property_applications,
      });
    }
    if ((services?.active_leases ?? 0) > 0) {
      base.push({
        key: "activeRentals",
        icon: <FaKey size={18} />,
        labelKey: "activeRental",
        fallback: "Active rentals",
        badge: services?.active_leases,
      });
    }
    if ((services?.upcoming_stays ?? 0) > 0 || services?.modules?.stays) {
      base.push({
        key: "upcomingStays",
        icon: <FaBed size={18} />,
        labelKey: "upcomingStays",
        fallback: "Upcoming stays",
        badge: services?.upcoming_stays,
      });
    }
    if ((services?.documents ?? 0) > 0 || services?.modules?.documents) {
      base.push({
        key: "documents",
        icon: <FaFolderOpen size={18} />,
        labelKey: "documents",
        fallback: "Documents",
        badge: services?.documents,
      });
    }
    base.push(
      {
        key: "trackDelivery",
        icon: <FaTruck size={18} />,
        labelKey: "trackDelivery",
        fallback: "Track Delivery",
      },
      {
        key: "updateProfile",
        icon: <FaUserEdit size={18} />,
        labelKey: "updateProfile",
        fallback: "Update Profile",
      },
      {
        key: "orderHistory",
        icon: <FaHistory size={18} />,
        labelKey: "orderHistory",
        fallback: "Order History",
      },
      {
        key: "serviceBookings",
        icon: <FaHistory size={18} />,
        labelKey: "serviceBookings",
        fallback: "Service Bookings",
      },
      {
        key: "downloadInvoice",
        icon: <FaFileInvoice size={18} />,
        labelKey: "downloadInvoice",
        fallback: "Download Invoice",
      },
      {
        key: "deactivateAccount",
        icon: <FaUserSlash size={18} />,
        labelKey: "deactivateAccountTitle",
        fallback: "Deactivate Account",
        danger: true,
      },
    );
    return base;
  }, [services]);

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(clearAllCart());
    router.push("/LoginScreenUser");
  };

  return (
    <aside className="h-screen w-72 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-600 text-white shadow-2xl flex flex-col sticky top-0 z-30 rounded-r-3xl border-r-2 border-blue-200">
      <div className="py-7 px-8 text-2xl font-black tracking-wide bg-blue-950/80 rounded-tr-3xl rounded-br-3xl mb-4 drop-shadow-xl shadow-blue-800 text-center">
        {t("myKudya", "My Kudya")}
      </div>
      <nav className="flex-1 flex flex-col gap-1 px-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() =>
              item.key === "deactivateAccount"
                ? onDeactivate && onDeactivate()
                : setSelectedMenu(item.key)
            }
            className={`flex items-center gap-3 rounded-2xl px-6 py-3 text-base font-semibold transition-all
              ${
                selectedMenu === item.key
                  ? "bg-yellow-400/90 text-blue-900 shadow-lg scale-105"
                  : item.danger
                  ? "bg-red-500/20 text-red-100 hover:bg-red-600/40 hover:text-white"
                  : "hover:bg-blue-500/80 hover:text-yellow-100 text-white"
              }`}
            aria-current={selectedMenu === item.key}
          >
            {item.icon}
            <span className="flex-1 text-left">{t(item.labelKey, item.fallback)}</span>
            {typeof item.badge === "number" && item.badge > 0 ? (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{item.badge}</span>
            ) : null}
          </button>
        ))}
        <Link
          href="/notifications"
          className="mt-2 flex items-center gap-3 rounded-2xl px-6 py-3 text-base font-semibold hover:bg-blue-500/80"
        >
          <FaBell size={18} />
          <span>{t("notifications", "Notifications")}</span>
        </Link>
      </nav>
      <button
        className="flex items-center gap-3 px-6 py-3 mb-6 mt-8 rounded-2xl font-bold text-lg transition-all bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500 shadow-lg"
        onClick={handleLogout}
      >
        <FaSignOutAlt size={18} />
        {t("logout", "Logout")}
      </button>
    </aside>
  );
};

export default Sidebar;
