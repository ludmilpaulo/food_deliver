import type { FoodFulfilmentStatus, PartnerAction, PartnerTab } from './types';

export const PARTNER_TABS: PartnerTab[] = ['new', 'accepted', 'preparing', 'ready', 'with_courier', 'completed', 'cancelled'];

export const TAB_LABELS: Record<PartnerTab, [string, string]> = {
  new: ['fpTabNew', 'New'],
  accepted: ['fpTabAccepted', 'Accepted'],
  preparing: ['fpTabPreparing', 'Preparing'],
  ready: ['fpTabReady', 'Ready for pickup'],
  with_courier: ['fpTabWithCourier', 'With courier'],
  completed: ['fpTabCompleted', 'Completed'],
  cancelled: ['fpTabCancelled', 'Cancelled / rejected'],
};

export const STATUS_LABELS: Record<FoodFulfilmentStatus, [string, string]> = {
  new: ['fpStatusNew', 'New'],
  accepted: ['fpStatusAccepted', 'Accepted'],
  preparing: ['fpStatusPreparing', 'Preparing'],
  ready: ['fpStatusReady', 'Ready for pickup'],
  courier_assigned: ['fpStatusCourierAssigned', 'Courier on the way'],
  picked_up: ['fpStatusPickedUp', 'With courier'],
  out_for_delivery: ['fpStatusOutForDelivery', 'Out for delivery'],
  delivered: ['fpStatusDelivered', 'Delivered'],
  completed: ['fpStatusCompleted', 'Completed'],
  cancelled: ['fpStatusCancelled', 'Cancelled'],
  refunded: ['fpStatusRefunded', 'Refunded'],
};

export const STATUS_STYLES: Record<FoodFulfilmentStatus, string> = {
  new: 'bg-food text-white',
  accepted: 'bg-violet-100 text-violet-800',
  preparing: 'bg-food-soft text-orange-800',
  ready: 'bg-amber-100 text-amber-800',
  courier_assigned: 'bg-sky-100 text-sky-800',
  picked_up: 'bg-sky-100 text-sky-800',
  out_for_delivery: 'bg-sky-100 text-sky-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-slate-200 text-slate-700',
};

export const ACTION_LABELS: Record<PartnerAction, [string, string]> = {
  accept: ['fpActionAccept', 'Accept order'],
  reject: ['fpActionReject', 'Reject'],
  start_preparing: ['fpActionStartPreparing', 'Start preparing'],
  mark_ready: ['fpActionMarkReady', 'Mark ready'],
  handover: ['fpActionHandover', 'Confirm courier collection'],
  collected: ['fpActionCollected', 'Customer collected'],
};

/** Actions that need extra input before they are sent to the server. */
export function actionNeeds(action: PartnerAction): 'prep_minutes' | 'reason' | 'pin' | null {
  if (action === 'accept') return 'prep_minutes';
  if (action === 'reject') return 'reason';
  if (action === 'collected') return 'pin';
  return null;
}

export function validatePrepMinutes(value: string): number | null {
  const minutes = Number(value);
  return Number.isInteger(minutes) && minutes >= 1 && minutes <= 240 ? minutes : null;
}

export function validatePin(value: string): string | null {
  const pin = value.trim();
  return /^\d{4,8}$/.test(pin) ? pin : null;
}

export function minutesSince(iso: string, now: number = Date.now()): number {
  const created = new Date(iso).getTime();
  return Number.isFinite(created) ? Math.max(0, Math.floor((now - created) / 60_000)) : 0;
}

export function waitingLabel(minutes: number): [string, string, Record<string, number>] {
  if (minutes < 60) return ['fpMinutesAgo', '{minutes} min ago', { minutes }];
  if (minutes < 1440) return ['fpHoursAgo', '{hours} h ago', { hours: Math.floor(minutes / 60) }];
  return ['fpDaysAgo', '{days} d ago', { days: Math.floor(minutes / 1440) }];
}
