"use client";

import React from "react";
import { isAxiosError } from "axios";
import { adminUi } from "@/lib/adminUi";

export type Translate = (key: string, fallback?: string) => string;

export function apiDetail(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { detail?: unknown } | undefined;
    if (data && typeof data.detail === "string" && data.detail.trim()) return data.detail;
    return fallback;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

export function StatusLine({ error, notice }: { error: string | null; notice: string | null }) {
  return (
    <>
      {error ? (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {notice}
        </p>
      ) : null}
    </>
  );
}

export function MfaField({ value, onChange, t }: { value: string; onChange: (next: string) => void; t: Translate }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-700">{t("mfaCode", "Authenticator code")}</span>
      <input
        className={adminUi.input + " mt-1 max-w-[12rem]"}
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="123456"
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 6))}
      />
    </label>
  );
}

export function Toggle({
  checked,
  label,
  onChange,
  disabled,
}: {
  checked: boolean;
  label: string;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-3 py-1.5 text-sm">
      <span className="text-slate-700">{label}</span>
      <input
        type="checkbox"
        className="h-4 w-4 accent-blue-600"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">{text}</p>;
}
