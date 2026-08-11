"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { MdMenu, MdRefresh, MdChevronRight } from "react-icons/md";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { supportedLocales } from "@/configs/translations";
import { adminPanelUrl, isAdminPanelId } from "@/configs/adminNav";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import { AdminPanelContent, type AdminPanelId } from "./adminPanels";
import { adminUi, getAdminPanelMeta, ADMIN_NAV_GROUPS } from "@/lib/adminUi";

const Sidebar = dynamic(() => import("./Sidebar"), {
  ssr: false,
  loading: () => (
    <div className="hidden h-full w-[17.5rem] shrink-0 animate-pulse bg-slate-950 md:block" />
  ),
});

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { t, languageCode, changeLanguage } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<AdminPanelId>("superApp");
  const handleSidebarToggle = () => setIsSidebarOpen((open) => !open);

  useEffect(() => {
    const panel = searchParams.get("panel");
    if (isAdminPanelId(panel)) {
      setActivePanel(panel);
    } else if (!panel) {
      setActivePanel("superApp");
    }
  }, [searchParams]);

  const handleSelectPanel = useCallback(
    (panel: AdminPanelId) => {
      setActivePanel(panel);
      router.push(adminPanelUrl(panel));
    },
    [router],
  );

  const meta = getAdminPanelMeta(activePanel);
  const group = ADMIN_NAV_GROUPS.find((g) => g.id === meta.group);
  const nowLabel = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <div className={`flex h-screen overflow-hidden ${adminUi.shell}`}>
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={handleSidebarToggle}
        activePanel={activePanel}
        onSelectPanel={handleSelectPanel}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-xl">
          <div className="flex items-center gap-3 px-3 py-3 sm:px-5">
            <button
              type="button"
              onClick={handleSidebarToggle}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden"
              aria-label={t("openMenu", "Open menu")}
            >
              <MdMenu className="text-xl" />
            </button>

            <div className="min-w-0 flex-1">
              <nav
                className="mb-0.5 flex items-center gap-1 text-[11px] font-medium text-slate-400"
                aria-label="Breadcrumb"
              >
                <span className="hidden sm:inline">{t("adminConsole", "Admin console")}</span>
                <MdChevronRight className="hidden text-sm sm:inline" />
                {group ? (
                  <>
                    <span className="truncate">{t(group.labelKey, group.labelDefault)}</span>
                    <MdChevronRight className="shrink-0 text-sm" />
                  </>
                ) : null}
                <span className="truncate text-slate-500">{nowLabel}</span>
              </nav>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <h1 className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                  {t(meta.labelKey, meta.labelDefault)}
                </h1>
                <p className="hidden truncate text-sm text-slate-500 lg:block">
                  {t(meta.descKey, meta.descDefault)}
                </p>
              </div>
            </div>

            <select
              className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 shadow-sm md:hidden"
              value={languageCode}
              onChange={(e) => changeLanguage(e.target.value as typeof languageCode)}
              aria-label={t("language", "Language")}
            >
              {supportedLocales.map((loc) => (
                <option key={loc} value={loc}>
                  {loc.toUpperCase()}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => router.refresh()}
              className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:inline-flex"
            >
              <MdRefresh className="text-base" />
              {t("refresh", "Refresh")}
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className={adminUi.content}>
            {children}
            <AdminPanelContent activePanel={activePanel} />
          </div>
        </main>
      </div>
    </div>
  );
}

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AdminRouteGuard>
      <Suspense
        fallback={
          <div className={`flex h-screen items-center justify-center ${adminUi.shell}`}>
            <div className="flex flex-col items-center gap-3">
              <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600" />
              <p className="text-sm font-medium text-slate-500">
                Loading admin console…
              </p>
            </div>
          </div>
        }
      >
        <AdminLayoutInner>{children}</AdminLayoutInner>
      </Suspense>
    </AdminRouteGuard>
  );
};

export default AdminLayout;
