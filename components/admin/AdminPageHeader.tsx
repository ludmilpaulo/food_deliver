"use client";

import React from "react";
import { adminUi } from "@/lib/adminUi";

type AdminPageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
};

export default function AdminPageHeader({ title, subtitle, actions, badge }: AdminPageHeaderProps) {
  return (
    <header className="mb-6 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_28px_-18px_rgba(15,23,42,0.12)]">
      <div className="relative px-4 py-5 sm:px-6 sm:py-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-400" />
        <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-blue-500/[0.06] blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {badge ? <div className="mb-2.5 flex flex-wrap items-center gap-2">{badge}</div> : null}
            <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
              {title}
            </h1>
            {subtitle ? <p className={`${adminUi.sectionSub} max-w-2xl`}>{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      </div>
    </header>
  );
}
