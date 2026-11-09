'use client';

import { useTranslation } from '@/hooks/useTranslation';
import type { OrderStatusKey } from '../types';

const STYLES: Record<OrderStatusKey, string> = {
  placed: 'bg-violet-100 text-violet-800',
  confirmed: 'bg-violet-100 text-violet-800',
  preparing: 'bg-food-soft text-orange-800',
  picking: 'bg-food-soft text-orange-800',
  packed: 'bg-amber-100 text-amber-800',
  ready: 'bg-amber-100 text-amber-800',
  courier_assigned: 'bg-sky-100 text-sky-800',
  on_the_way: 'bg-sky-100 text-sky-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-700',
};

export const STATUS_LABEL_KEYS: Record<OrderStatusKey, [string, string]> = {
  placed: ['foodStatusPlaced', 'Order received'],
  confirmed: ['foodStatusAccepted', 'Restaurant accepted'],
  preparing: ['foodStatusPreparing', 'Preparing food'],
  picking: ['foodStatusPicking', 'Picking items'],
  packed: ['foodStatusPacked', 'Packed'],
  ready: ['foodStatusReady', 'Ready for pickup'],
  courier_assigned: ['foodStatusCourierAssigned', 'Courier assigned'],
  on_the_way: ['foodStatusOnTheWay', 'Out for delivery'],
  delivered: ['foodStatusDelivered', 'Delivered'],
  cancelled: ['foodStatusCancelled', 'Cancelled'],
};

export default function OrderStatusBadge({ status }: { status: OrderStatusKey }) {
  const { t } = useTranslation();
  const [key, fallback] = STATUS_LABEL_KEYS[status] ?? ['foodStatusPlaced', status];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STYLES[status] ?? STYLES.placed}`}>
      {t(key, fallback)}
    </span>
  );
}
