'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ComponentType, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';

export type WorkspaceNavItem = { href: string; label: string; icon: ComponentType<{ className?: string }>; badge?: number };

type Props = {
  title: string;
  subtitle?: string;
  nav: WorkspaceNavItem[];
  actions?: ReactNode;
  children: ReactNode;
};

export default function WorkspaceShell({ title, subtitle, nav, actions, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) =>
    pathname === href || (href !== nav[0]?.href && Boolean(pathname?.startsWith(`${href}/`)));

  const links = (
    <nav className="space-y-1">
      {nav.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
              active ? 'bg-white/15 text-white' : 'text-violet-100 hover:bg-white/10'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.badge ? <span className="rounded-full bg-food px-2 text-xs font-bold text-white">{item.badge}</span> : null}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 flex-col gap-6 bg-gradient-to-b from-kudya to-violet-900 p-5 text-white lg:flex">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-white px-2 py-0.5 text-sm font-bold text-kudya">Kudya</span>
            <span className="rounded-lg bg-food px-2 py-0.5 text-sm font-semibold">Food</span>
          </div>
          <p className="mt-3 text-sm font-semibold">{title}</p>
          {subtitle ? <p className="text-xs text-violet-200">{subtitle}</p> : null}
        </div>
        {links}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden" onClick={() => setOpen(false)}>
          <div
            className="h-full w-72 space-y-6 bg-gradient-to-b from-kudya to-violet-900 p-5 text-white"
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-full p-1 hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
            <p className="text-sm font-semibold">{title}</p>
            {links}
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-lg p-2 text-kudya lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
            {subtitle ? <p className="truncate text-xs text-slate-500">{subtitle}</p> : null}
          </div>
          {actions}
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
      </div>
    </div>
  );
}

export function StatCard({ label, value, hint, tone = 'default' }: { label: string; value: ReactNode; hint?: string; tone?: 'default' | 'food' | 'good' | 'bad' }) {
  const tones = {
    default: 'text-slate-900',
    food: 'text-orange-600',
    good: 'text-emerald-700',
    bad: 'text-red-600',
  };
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${tones[tone]}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
