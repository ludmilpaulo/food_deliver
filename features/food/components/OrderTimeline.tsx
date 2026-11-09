'use client';

import { Check } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { OrderStep } from '../types';
import { STATUS_LABEL_KEYS } from './OrderStatusBadge';

function formatTime(value: string | null | undefined, locale: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

export default function OrderTimeline({ steps, cancelled = false }: { steps: OrderStep[]; cancelled?: boolean }) {
  const { t, languageCode } = useTranslation();
  return (
    <ol className="space-y-0" aria-label={t('foodOrderProgress', 'Order progress')}>
      {steps.map((step, index) => {
        const [key, fallback] = STATUS_LABEL_KEYS[step.key] ?? ['', step.label];
        const time = formatTime(step.at, languageCode);
        const last = index === steps.length - 1;
        const tone =
          step.state === 'done'
            ? 'bg-kudya text-white'
            : step.state === 'active'
              ? 'bg-food text-white ring-4 ring-food-soft'
              : 'bg-slate-100 text-slate-400';
        return (
          <li key={step.key} className="relative flex gap-3 pb-5" aria-current={step.state === 'active' ? 'step' : undefined}>
            {!last ? (
              <span
                className={`absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-0.5 ${
                  step.state === 'done' ? 'bg-kudya' : 'bg-slate-200'
                }`}
                aria-hidden
              />
            ) : null}
            <span className={`relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone}`}>
              {step.state === 'done' ? <Check className="h-4 w-4" aria-hidden /> : <span className="text-xs">{index + 1}</span>}
            </span>
            <div className="pt-1">
              <p className={`text-sm font-semibold ${step.state === 'pending' ? 'text-slate-400' : 'text-slate-900'}`}>
                {key ? t(key, fallback) : step.label}
                {step.state === 'active' && !cancelled ? (
                  <span className="ml-2 text-xs font-medium text-food">{t('foodInProgress', 'In progress')}</span>
                ) : null}
              </p>
              {time ? <p className="text-xs text-slate-500">{time}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
