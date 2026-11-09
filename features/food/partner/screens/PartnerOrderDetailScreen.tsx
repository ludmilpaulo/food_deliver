'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Bike, ShoppingBag } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { foodErrorMessage } from '../../api/foodApi';
import { FoodEmpty, FoodError, FoodSkeletonGrid } from '../../components/FoodStates';
import { Panel } from '../../components/WorkspaceShell';
import { formatMoney } from '../../lib/money';
import { useGetPartnerOrderQuery, useRunPartnerActionMutation } from '../partnerApi';
import { ACTION_LABELS, STATUS_LABELS, STATUS_STYLES, actionNeeds, validatePin, validatePrepMinutes } from '../labels';
import type { PartnerAction } from '../types';

const PRIMARY: PartnerAction[] = ['accept', 'start_preparing', 'mark_ready', 'handover', 'collected'];

export default function PartnerOrderDetailScreen({ orderId }: { orderId: number }) {
  const { t, languageCode } = useTranslation();
  const order = useGetPartnerOrderQuery(orderId, { pollingInterval: 20_000 });
  const [run, { isLoading }] = useRunPartnerActionMutation();
  const [pending, setPending] = useState<PartnerAction | null>(null);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (order.isLoading) return <FoodSkeletonGrid count={3} variant="row" />;
  if (order.isError || !order.data) {
    const status = (order.error as { status?: number } | undefined)?.status;
    return status === 404 ? <FoodEmpty title={t('fpOrderNotFound', 'Order not found')} /> : <FoodError onRetry={order.refetch} />;
  }
  const data = order.data;
  const money = (value: string) => formatMoney(value, data.currency, languageCode);
  const [statusKey, statusFallback] = STATUS_LABELS[data.status] ?? ['', data.status_label];

  const start = (action: PartnerAction) => {
    setError(null);
    const needs = actionNeeds(action);
    if (!needs) {
      void submit(action, '');
      return;
    }
    setPending(action);
    setInput(needs === 'prep_minutes' ? String(data.prep_estimate_minutes ?? 20) : '');
  };

  const submit = async (action: PartnerAction, value: string) => {
    const needs = actionNeeds(action);
    const body: { id: number; action: PartnerAction; reason?: string; prep_minutes?: number; pin?: string } = { id: data.id, action };
    if (needs === 'prep_minutes') {
      const minutes = validatePrepMinutes(value);
      if (minutes === null) {
        setError(t('fpPrepInvalid', 'Enter a preparation time between 1 and 240 minutes.'));
        return;
      }
      body.prep_minutes = minutes;
    } else if (needs === 'reason') {
      if (!value.trim()) {
        setError(t('fpReasonRequired', 'Give the customer a reason.'));
        return;
      }
      body.reason = value.trim();
    } else if (needs === 'pin') {
      const pin = validatePin(value);
      if (!pin) {
        setError(t('fpPinInvalid', 'Enter the PIN the customer shows you.'));
        return;
      }
      body.pin = pin;
    }
    try {
      await run(body).unwrap();
      setPending(null);
      setInput('');
    } catch (err) {
      setError(foodErrorMessage(err, t('fpActionFailed', 'The order could not be updated.')));
    }
  };

  return (
    <div className="space-y-5">
      <Link href="/partner/food/orders" className="inline-flex items-center gap-1 text-sm font-medium text-kudya hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t('fpBackToOrders', 'Back to orders')}
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{data.number}</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[data.status] ?? ''}`}>
          {statusKey ? t(statusKey, statusFallback) : statusFallback}
        </span>
        <span className="inline-flex items-center gap-1 text-sm text-slate-600">
          {data.fulfilment_type === 'pickup' ? <ShoppingBag className="h-4 w-4" aria-hidden /> : <Bike className="h-4 w-4" aria-hidden />}
          {data.fulfilment_type === 'pickup' ? t('fpPickup', 'Pickup') : t('fpDelivery', 'Delivery')}
        </span>
      </div>

      {data.actions.length ? (
        <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-wrap gap-2">
            {data.actions.map((action) => (
              <button
                key={action}
                type="button"
                disabled={isLoading}
                onClick={() => start(action)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-50 ${
                  PRIMARY.includes(action) ? 'bg-kudya text-white hover:bg-kudya-secondary' : 'border border-red-200 text-red-600 hover:bg-red-50'
                }`}
              >
                {t(...ACTION_LABELS[action])}
              </button>
            ))}
          </div>
          {pending ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void submit(pending, input);
              }}
              className="flex flex-wrap items-end gap-2"
            >
              <label className="flex-1 space-y-1 text-sm">
                <span className="font-medium text-slate-700">
                  {actionNeeds(pending) === 'prep_minutes'
                    ? t('fpPrepMinutes', 'Preparation time (minutes)')
                    : actionNeeds(pending) === 'reason'
                      ? t('fpRejectReason', 'Reason shown to the customer')
                      : t('fpCustomerPin', 'Customer PIN')}
                </span>
                <input
                  autoFocus
                  value={input}
                  inputMode={actionNeeds(pending) === 'reason' ? 'text' : 'numeric'}
                  maxLength={actionNeeds(pending) === 'reason' ? 255 : 8}
                  onChange={(event) => setInput(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </label>
              <button type="submit" disabled={isLoading} className="rounded-full bg-kudya px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                {t('fpConfirm', 'Confirm')}
              </button>
              <button type="button" onClick={() => setPending(null)} className="rounded-full px-4 py-2.5 text-sm text-slate-600">
                {t('fpCancel', 'Cancel')}
              </button>
            </form>
          ) : null}
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          {data.fulfilment_type === 'delivery' && data.status === 'ready' ? (
            <p className="text-xs text-slate-500">{t('fpWaitingCourier', 'Waiting for a courier to accept. Only the courier can complete the delivery.')}</p>
          ) : null}
        </div>
      ) : data.fulfilment_type === 'delivery' && data.status === 'ready' ? (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t('fpWaitingCourier', 'Waiting for a courier to accept. Only the courier can complete the delivery.')}
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Panel title={t('fpItems', 'Items')}>
          <ul className="divide-y divide-slate-100">
            {data.lines.map((line) => (
              <li key={line.id} className="flex justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-semibold text-slate-900">
                    {Number(line.quantity)} × {line.name}
                  </p>
                  {line.addons.length ? <p className="text-slate-600">+ {line.addons.map((addon) => addon.name).join(', ')}</p> : null}
                  {line.special_instructions ? (
                    <p className="mt-1 rounded-lg bg-food-soft px-2 py-1 text-orange-900">“{line.special_instructions}”</p>
                  ) : null}
                </div>
                <span className="shrink-0 font-medium">{money(line.subtotal)}</span>
              </li>
            ))}
          </ul>
          {data.delivery_notes ? (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {t('fpOrderNotes', 'Order notes')}: {data.delivery_notes}
            </p>
          ) : null}
          <dl className="space-y-1 border-t border-slate-100 pt-3 text-sm">
            <div className="flex justify-between"><dt>{t('fpSubtotal', 'Subtotal')}</dt><dd>{money(data.subtotal)}</dd></div>
            <div className="flex justify-between"><dt>{t('fpDiscount', 'Discount')}</dt><dd>-{money(data.discount_amount)}</dd></div>
            <div className="flex justify-between"><dt>{t('fpDeliveryFee', 'Delivery fee')}</dt><dd>{money(data.delivery_fee)}</dd></div>
            <div className="flex justify-between font-bold"><dt>{t('fpTotal', 'Total')}</dt><dd>{money(data.total)}</dd></div>
          </dl>
        </Panel>

        <div className="space-y-5">
          <Panel title={t('fpDetails', 'Details')}>
            <dl className="space-y-1 text-sm text-slate-700">
              <div className="flex justify-between"><dt>{t('fpCustomer', 'Customer')}</dt><dd>{data.customer_name}</dd></div>
              <div className="flex justify-between"><dt>{t('fpPayment', 'Payment')}</dt><dd>{data.payment_method} · {data.payment_status}</dd></div>
              {data.prep_estimate_minutes ? (
                <div className="flex justify-between"><dt>{t('fpPrepTime', 'Prep time')}</dt><dd>{data.prep_estimate_minutes} min</dd></div>
              ) : null}
              {data.courier ? (
                <div className="flex justify-between"><dt>{t('fpCourier', 'Courier')}</dt><dd>{data.courier.name} {data.courier.vehicle ? `· ${data.courier.vehicle}` : ''}</dd></div>
              ) : null}
              {data.cancellation_reason ? (
                <div className="text-red-700">{t('fpCancelledReason', 'Cancelled')}: {data.cancellation_reason}</div>
              ) : null}
            </dl>
          </Panel>
          {data.settlement ? (
            <Panel title={t('fpSettlement', 'Settlement')}>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between"><dt>{t('fpGross', 'Gross')}</dt><dd>{money(data.settlement.gross)}</dd></div>
                <div className="flex justify-between"><dt>{t('fpPlatformFee', 'Kudya commission')}</dt><dd>-{money(data.settlement.platform_fee)}</dd></div>
                <div className="flex justify-between font-semibold"><dt>{t('fpNet', 'Your earnings')}</dt><dd>{money(data.settlement.net)}</dd></div>
                <p className="text-xs text-slate-500">{data.settlement.paid_out ? t('fpPaidOut', 'Paid out') : t('fpAwaitingPayout', 'Awaiting payout')}</p>
              </dl>
            </Panel>
          ) : null}
          <Panel title={t('fpTimeline', 'Timeline')}>
            <ol className="space-y-2 text-sm">
              {data.timeline.map((event, index) => (
                <li key={`${event.status}-${index}`} className="flex justify-between gap-3">
                  <span className="text-slate-700">{event.label}</span>
                  <span className="text-xs text-slate-400">{new Date(event.at).toLocaleTimeString(languageCode, { hour: '2-digit', minute: '2-digit' })}</span>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
    </div>
  );
}
