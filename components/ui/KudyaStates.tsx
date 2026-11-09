"use client";

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

const buttonClass =
  "inline-flex items-center justify-center rounded-full bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-60";

export function KudyaButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${buttonClass} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function KudyaCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function KudyaTextField(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-violet-600 ${props.className ?? ""}`}
    />
  );
}

export function KudyaSkeleton({ className = "h-24" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />;
}

export function KudyaEmptyState({ title, body }: { title: string; body: string }) {
  return (
    <KudyaCard>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{body}</p>
    </KudyaCard>
  );
}

export function KudyaErrorState({
  title,
  body,
  onRetry,
  retryLabel,
}: {
  title: string;
  body: string;
  onRetry?: () => void;
  retryLabel: string;
}) {
  return (
    <KudyaCard className="border-red-200">
      <h2 className="text-lg font-semibold text-red-700">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{body}</p>
      {onRetry ? (
        <KudyaButton className="mt-3" onClick={onRetry} type="button">
          {retryLabel}
        </KudyaButton>
      ) : null}
    </KudyaCard>
  );
}
