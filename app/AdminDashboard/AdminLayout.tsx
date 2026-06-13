// app/AdminDashboard/AdminLayout.tsx
"use client";

import React, { useState } from "react";
import { MdMenu } from "react-icons/md";
import dynamic from "next/dynamic";
import { useTranslation } from "@/hooks/useTranslation";
import { supportedLocales } from "@/configs/translations";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";

const Sidebar = dynamic(() => import("./Sidebar"), {
  ssr: false,
  loading: () => <p>Loading…</p>,
});

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, languageCode, changeLanguage } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const handleSidebarToggle = () => setIsSidebarOpen((open) => !open);

  return (
    <AdminRouteGuard>
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
        <Sidebar isOpen={isSidebarOpen} onToggle={handleSidebarToggle} />
        <main className="flex-1 overflow-y-auto bg-gray-100 pt-12 md:pt-0">{children}</main>
      </div>
    </AdminRouteGuard>
  );
};

export default AdminLayout;
