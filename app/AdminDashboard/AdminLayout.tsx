// app/AdminDashboard/AdminLayout.tsx
"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { MdMenu } from "react-icons/md";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { supportedLocales } from "@/configs/translations";
import { adminPanelUrl, isAdminPanelId } from "@/configs/adminNav";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import { AdminPanelContent, type AdminPanelId } from "./adminPanels";

const Sidebar = dynamic(() => import("./Sidebar"), {
  ssr: false,
  loading: () => <p>Loading…</p>,
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
    }
  }, [searchParams]);

  const handleSelectPanel = useCallback(
    (panel: AdminPanelId) => {
      setActivePanel(panel);
      router.push(adminPanelUrl(panel));
    },
    [router],
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="absolute top-0 left-0 z-50 flex w-full items-center justify-between bg-white px-3 py-2 shadow-sm md:hidden">
        <button onClick={handleSidebarToggle} className="text-2xl text-blue-500 p-1">
          <MdMenu />
        </button>
        <select
          className="rounded border px-2 py-1 text-sm"
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
      </div>
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={handleSidebarToggle}
        activePanel={activePanel}
        onSelectPanel={handleSelectPanel}
      />
      <main className="flex-1 min-w-0 overflow-y-auto bg-gray-100 pt-12 md:pt-0">
        {children}
        <AdminPanelContent activePanel={activePanel} />
      </main>
    </div>
  );
}

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AdminRouteGuard>
      <Suspense fallback={<div className="flex h-screen items-center justify-center bg-gray-100">Loading…</div>}>
        <AdminLayoutInner>{children}</AdminLayoutInner>
      </Suspense>
    </AdminRouteGuard>
  );
};

export default AdminLayout;
