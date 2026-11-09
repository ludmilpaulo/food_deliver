'use client';

import type { ReactNode } from 'react';
import { AlertTriangle, SearchX } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export function FoodSkeletonGrid({ count = 6, variant = 'card' }: { count?: number; variant?: 'card' | 'row' }) {
  return (
    <div
      className={variant === 'card' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}
      role="status"
      aria-busy="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="animate-pulse overflow-hidden rounded-2xl border border-slate-100 bg-white">
          {variant === 'card' ? <div className="h-36 bg-slate-200" /> : null}
          <div className="space-y-2 p-4">
            <div className="h-4 w-2/3 rounded bg-slate-200" />
            <div className="h-3 w-1/2 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FoodEmpty({ title, message, action }: { title: string; message?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
      <SearchX className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
      <h3 className="mt-3 text-lg font-semibold text-slate-900">{title}</h3>
      {message ? <p className="mt-1 text-sm text-slate-500">{message}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function FoodError({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-8 text-center" role="alert">
      <AlertTriangle className="mx-auto h-8 w-8 text-red-500" aria-hidden />
      <p className="mt-2 text-sm text-red-700">{message || t('foodLoadFailed', 'We could not load this right now.')}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          {t('foodRetry', 'Try again')}
        </button>
      ) : null}
    </div>
  );
}
