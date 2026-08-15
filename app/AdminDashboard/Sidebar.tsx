"use client";

import React, { useMemo, useState } from "react";
import {
  MdClose,
  MdLogout,
  MdHome,
  MdStorefront,
  MdRestaurantMenu,
  MdReceiptLong,
  MdBarChart,
  MdPeople,
  MdLocalShipping,
  MdHandshake,
  MdVerifiedUser,
  MdMedicalServices,
  MdBadge,
  MdSupportAgent,
  MdPayments,
  MdTune,
  MdAttachMoney,
  MdTranslate,
  MdSettingsBackupRestore,
  MdHotel,
  MdSearch,
  MdDashboard,
  MdKeyboardArrowRight,
} from "react-icons/md";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "@/hooks/useTranslation";
import { supportedLocales } from "@/configs/translations";
import { logoutUser } from "@/redux/slices/authSlice";
import type { RootState } from "@/redux/store";
import type { AdminPanelId } from "./adminPanels";
import {
  ADMIN_NAV_GROUPS,
  ADMIN_NAV_ITEMS,
  type AdminNavGroupId,
} from "@/lib/adminUi";

type SidebarProps = {
  isOpen: boolean;
  onToggle: () => void;
  activePanel: AdminPanelId;
  onSelectPanel: (panel: AdminPanelId) => void;
};

const PANEL_ICONS: Record<AdminPanelId, React.ReactNode> = {
  superApp: <MdDashboard className="text-[1.05rem]" />,
  stores: <MdStorefront className="text-[1.05rem]" />,
  menus: <MdRestaurantMenu className="text-[1.05rem]" />,
  orders: <MdReceiptLong className="text-[1.05rem]" />,
  reports: <MdBarChart className="text-[1.05rem]" />,
  customers: <MdPeople className="text-[1.05rem]" />,
  drivers: <MdLocalShipping className="text-[1.05rem]" />,
  partners: <MdHandshake className="text-[1.05rem]" />,
  kyc: <MdVerifiedUser className="text-[1.05rem]" />,
  doctorVerification: <MdMedicalServices className="text-[1.05rem]" />,
  driverVerification: <MdBadge className="text-[1.05rem]" />,
  liveSupport: <MdSupportAgent className="text-[1.05rem]" />,
  payouts: <MdPayments className="text-[1.05rem]" />,
  platformControl: <MdTune className="text-[1.05rem]" />,
  propertyReview: <MdHome className="text-[1.05rem]" />,
  propertyApplications: <MdHome className="text-[1.05rem]" />,
  pricing: <MdAttachMoney className="text-[1.05rem]" />,
  verticalOps: <MdHotel className="text-[1.05rem]" />,
  translations: <MdTranslate className="text-[1.05rem]" />,
  backupExport: <MdSettingsBackupRestore className="text-[1.05rem]" />,
  payments: <MdPayments className="text-[1.05rem]" />,
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, activePanel, onSelectPanel }) => {
  const { t, languageCode, changeLanguage } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [query, setQuery] = useState("");

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

  const filteredByGroup = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map<AdminNavGroupId, typeof ADMIN_NAV_ITEMS>();
    for (const group of ADMIN_NAV_GROUPS) {
      const items = ADMIN_NAV_ITEMS.filter((item) => {
        if (item.group !== group.id) return false;
        if (!q) return true;
        const label = t(item.labelKey, item.labelDefault).toLowerCase();
        const desc = t(item.descKey, item.descDefault).toLowerCase();
        return label.includes(q) || desc.includes(q) || item.key.toLowerCase().includes(q);
      });
      if (items.length) map.set(group.id, items);
    }
    return map;
  }, [query, t]);

  const displayName = authUser?.username || t("administrator", "Administrator");
  const initial = displayName.slice(0, 1).toUpperCase();

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label={t("closeMenu", "Close menu")}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[3px] md:hidden"
          onClick={onToggle}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[17.75rem] flex-col border-r border-white/[0.06] bg-[#0b1220] text-slate-100 shadow-2xl shadow-slate-950/40 transition-transform duration-200 md:relative md:z-0 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${isOpen ? "flex" : "hidden md:flex"}`}
      >
        <div className="relative overflow-hidden border-b border-white/[0.06] px-4 py-4">
          <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-blue-500/20 blur-2xl" />
          <div className="relative flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-white/20">
                <Image
                  src="https://www.kudya.shop/media/logo/azul.png"
                  width={80}
                  height={80}
                  className="h-full w-full object-contain p-1"
                  alt="Kudya"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold tracking-tight text-white">
                  Kudya Admin
                </p>
                <p className="truncate text-xs text-slate-400">
                  {t("platformConsole", "Platform console")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggle}
              className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 md:hidden"
              aria-label={t("closeMenu", "Close menu")}
            >
              <MdClose className="text-xl" />
            </button>
          </div>
        </div>

        <div className="border-b border-white/[0.06] px-3 py-3">
          <div className="relative">
            <MdSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchAdmin", "Search panels…")}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-blue-400/40 focus:bg-white/[0.07] focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 py-3 scrollbar-thin">
          {ADMIN_NAV_GROUPS.map((group) => {
            const items = filteredByGroup.get(group.id);
            if (!items?.length) return null;
            return (
              <div key={group.id} className="mb-4">
                <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {t(group.labelKey, group.labelDefault)}
                </p>
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const active = activePanel === item.key;
                    return (
                      <li key={item.key}>
                        <button
                          type="button"
                          onClick={() => openPanel(item.key)}
                          aria-current={active ? "page" : undefined}
                          title={t(item.descKey, item.descDefault)}
                          className={`group flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-sm transition ${
                            active
                              ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-950/50"
                              : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                          }`}
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                              active
                                ? "bg-white/15 text-white"
                                : "bg-white/[0.04] text-slate-400 group-hover:bg-white/[0.08] group-hover:text-slate-200"
                            }`}
                          >
                            {PANEL_ICONS[item.key]}
                          </span>
                          <span className="min-w-0 flex-1 truncate font-medium">
                            {t(item.labelKey, item.labelDefault)}
                          </span>
                          {active ? (
                            <MdKeyboardArrowRight className="shrink-0 text-lg text-white/80" />
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
          {filteredByGroup.size === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-slate-500">
              {t("noPanelsFound", "No panels match your search.")}
            </p>
          ) : null}
        </nav>

        <div className="mt-auto space-y-2.5 border-t border-white/[0.06] p-3">
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.04] px-2.5 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-bold text-white shadow-md shadow-blue-900/40">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{displayName}</p>
              <p className="truncate text-xs text-slate-400">
                {t("administrator", "Administrator")}
              </p>
            </div>
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.25)]"
              title={t("online", "Online")}
            />
          </div>

          <label className="hidden text-xs text-slate-400 md:block">
            <span className="mb-1 block px-0.5">{t("language", "Language")}</span>
            <select
              className="w-full rounded-xl border border-white/[0.08] bg-[#0f172a] px-2.5 py-2 text-sm text-slate-100 outline-none transition focus:border-blue-400/40"
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

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
          >
            <MdLogout className="text-lg" />
            {t("logout", "Logout")}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
