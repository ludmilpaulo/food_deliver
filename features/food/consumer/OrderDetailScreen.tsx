'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Bike, CheckCircle2, Clock, CreditCard, FileText, MessageCircle, RotateCcw, Send, ShieldCheck, Star } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useCreatePaymentMutation } from '@/redux/slices/paymentsApi';
import { redirectToCheckout } from '@/lib/pendingPayment';
import {
  foodErrorMessage,
  useCancelOrderMutation,
  useGetOrderChatQuery,
  useGetOrderQuery,
  useRateOrderMutation,
  useRequestOrderRefundMutation,
  useSendOrderChatMutation,
} from '../api/foodApi';
import FoodHeader from '../components/FoodHeader';
import OrderStatusBadge from '../components/OrderStatusBadge';
import OrderTimeline from '../components/OrderTimeline';
import { FoodEmpty, FoodError, FoodSkeletonGrid } from '../components/FoodStates';
import CheckoutSummary from '../components/CheckoutSummary';
import { useOrderTracking } from '../hooks/useOrderTracking';
import { useReorder } from '../hooks/useReorder';
import { formatMoney } from '../lib/money';
import type { OrderDetail, RefundReason } from '../types';

const RATING_TAGS = ['foodTagTasty', 'foodTagHot', 'foodTagOnTime', 'foodTagPackaging', 'foodTagFriendly'];
const REFUND_REASONS: Array<[RefundReason, string, string]> = [
  ['missing_items', 'foodReasonMissing', 'Missing items'],
  ['wrong_items', 'foodReasonWrong', 'Wrong or incorrect food'],
  ['damaged', 'foodReasonDamaged', 'Damaged or spilled'],
  ['late', 'foodReasonLate', 'Delivery problem or very late'],
  ['quality', 'foodReasonQuality', 'Food quality'],
  ['other', 'foodReasonOther', 'Something else'],
];
const UNPAID_STATES = new Set(['unpaid', 'failed', 'cancelled', 'expired', 'rejected']);

function Card({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

function ChatPanel({ orderId }: { orderId: number }) {
  const { t, languageCode } = useTranslation();
  const chat = useGetOrderChatQuery(orderId);
  const [send, { isLoading }] = useSendOrderChatMutation();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    setError(null);
    try {
      await send({ id: orderId, text: text.trim() }).unwrap();
      setText('');
    } catch (err) {
      setError(foodErrorMessage(err, t('foodChatFailed', 'Message not sent.')));
    }
  };

  return (
    <Card title={t('foodChatWithCourier', 'Message your courier')} icon={<MessageCircle className="h-4 w-4 text-kudya" aria-hidden />}>
      <p className="text-xs text-slate-500">{t('foodChatPrivacy', 'Your phone number stays private. Messages are shared only with your courier.')}</p>
      <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl bg-slate-50 p-3" aria-live="polite">
        {chat.isLoading ? (
          <p className="text-sm text-slate-400">{t('foodLoading', 'Loading…')}</p>
        ) : chat.isError ? (
          <FoodError onRetry={chat.refetch} />
        ) : !chat.data?.length ? (
          <p className="text-sm text-slate-400">{t('foodNoMessages', 'No messages yet.')}</p>
        ) : (
          chat.data.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  message.sender === 'customer' ? 'bg-kudya text-white' : 'bg-white text-slate-800 ring-1 ring-slate-200'
                }`}
              >
                <p>{message.text}</p>
                <p className="mt-0.5 text-[10px] opacity-70">
                  {new Date(message.created_at).toLocaleTimeString(languageCode, { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={1000}
          placeholder={t('foodTypeMessage', 'Type a message')}
          aria-label={t('foodTypeMessage', 'Type a message')}
          className="min-w-0 flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          aria-label={t('foodSend', 'Send')}
          className="rounded-full bg-kudya p-2.5 text-white disabled:opacity-50"
        >
          <Send className="h-4 w-4" aria-hidden />
        </button>
      </form>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </Card>
  );
}

function RatingForm({ order }: { order: OrderDetail }) {
  const { t } = useTranslation();
  const [rate, { isLoading }] = useRateOrderMutation();
  const [storeRating, setStoreRating] = useState(0);
  const [driverRating, setDriverRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!storeRating) {
      setError(t('foodPickRating', 'Choose a rating from 1 to 5.'));
      return;
    }
    setError(null);
    try {
      await rate({
        id: order.id,
        store_rating: storeRating,
        driver_rating: order.driver && driverRating ? driverRating : null,
        tags: tags.map((key) => t(key)),
        comment: comment.trim(),
      }).unwrap();
    } catch (err) {
      setError(foodErrorMessage(err, t('foodRatingFailed', 'We could not save your rating.')));
    }
  };

  const stars = (value: number, onChange: (value: number) => void, label: string) => (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          role="radio"
          aria-checked={value === score}
          aria-label={t('foodStars', '{count} stars', { count: score })}
          onClick={() => onChange(score)}
          className="p-0.5"
        >
          <Star className={`h-7 w-7 ${score <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} aria-hidden />
        </button>
      ))}
    </div>
  );

  return (
    <Card title={t('foodRateOrder', 'Rate your order')} icon={<Star className="h-4 w-4 text-amber-500" aria-hidden />}>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <p className="text-sm font-medium text-slate-700">{order.store.name}</p>
          {stars(storeRating, setStoreRating, t('foodRateRestaurant', 'Rate the restaurant'))}
        </div>
        {order.driver ? (
          <div>
            <p className="text-sm font-medium text-slate-700">{t('foodRateCourier', 'Your courier')}</p>
            {stars(driverRating, setDriverRating, t('foodRateCourier', 'Your courier'))}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {RATING_TAGS.map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={tags.includes(key)}
              onClick={() => setTags((current) => (current.includes(key) ? current.filter((tag) => tag !== key) : [...current, key]))}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                tags.includes(key) ? 'border-kudya bg-violet-50 text-kudya' : 'border-slate-200 text-slate-600'
              }`}
            >
              {t(key)}
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={500}
          rows={3}
          placeholder={t('foodRatingComment', 'Tell us more (optional)')}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button type="submit" disabled={isLoading} className="rounded-full bg-kudya px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {t('foodSubmitRating', 'Submit rating')}
        </button>
      </form>
    </Card>
  );
}

function ReportIssue({ order }: { order: OrderDetail }) {
  const { t, languageCode } = useTranslation();
  const [request, { isLoading }] = useRequestOrderRefundMutation();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<RefundReason>('missing_items');
  const [details, setDetails] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (order.refund) {
    return (
      <Card title={t('foodReportIssue', 'Report an issue')}>
        <p className="text-sm text-slate-700">
          {t('foodRefundStatusLine', 'Refund request for {amount}: {status}', {
            amount: formatMoney(order.refund.amount, order.currency, languageCode),
            status: t(`foodRefund_${order.refund.status}`, order.refund.status),
          })}
        </p>
        <Link href="/messages" className="text-sm font-medium text-kudya hover:underline">
          {t('foodContactSupport', 'Contact support')}
        </Link>
      </Card>
    );
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await request({ id: order.id, reason, details: details.trim(), ...(amount ? { amount } : {}) }).unwrap();
      setOpen(false);
    } catch (err) {
      setError(foodErrorMessage(err, t('foodRefundFailed', 'We could not send your request.')));
    }
  };

  return (
    <Card title={t('foodReportIssue', 'Report an issue')}>
      {!open ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-kudya"
          >
            {t('foodRequestRefund', 'Request a refund')}
          </button>
          <Link href="/messages" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-kudya">
            {t('foodContactSupport', 'Contact support')}
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">{t('foodWhatWentWrong', 'What went wrong?')}</span>
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value as RefundReason)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            >
              {REFUND_REASONS.map(([value, key, fallback]) => (
                <option key={value} value={value}>
                  {t(key, fallback)}
                </option>
              ))}
            </select>
          </label>
          <textarea
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            maxLength={1000}
            rows={3}
            placeholder={t('foodIssueDetails', 'Describe the problem')}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">
              {t('foodRefundAmount', 'Amount to refund (optional, up to {total})', {
                total: formatMoney(order.total, order.currency, languageCode),
              })}
            </span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              max={order.total}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
          <p className="text-xs text-slate-500">
            {t('foodEvidenceHint', 'To share photos, send them to support after submitting; our team links them to this request.')}
          </p>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex gap-2">
            <button type="submit" disabled={isLoading} className="rounded-full bg-kudya px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {t('foodSendRequest', 'Send request')}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600">
              {t('foodCancel', 'Cancel')}
            </button>
          </div>
        </form>
      )}
    </Card>
  );
}

function CancelOrder({ order }: { order: OrderDetail }) {
  const { t } = useTranslation();
  const [cancel, { isLoading }] = useCancelOrderMutation();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const submit = async () => {
    setError(null);
    try {
      await cancel({ id: order.id, reason: reason.trim() || undefined }).unwrap();
      setOpen(false);
    } catch (err) {
      setError(foodErrorMessage(err, t('foodCancelFailed', 'We could not cancel this order.')));
    }
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      {!open ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">{t('foodCancelHint', 'You can cancel until the restaurant accepts your order.')}</p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            {t('foodCancelOrder', 'Cancel order')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={200}
            placeholder={t('foodCancelReason', 'Reason (optional)')}
            aria-label={t('foodCancelReason', 'Reason (optional)')}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => void submit()}
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {t('foodConfirmCancel', 'Yes, cancel')}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full px-4 py-2 text-sm text-slate-600">
              {t('foodKeepOrder', 'Keep order')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PayNow({ order }: { order: OrderDetail }) {
  const { t } = useTranslation();
  const [createPayment, { isLoading }] = useCreatePaymentMutation();
  const [error, setError] = useState<string | null>(null);
  const pay = async () => {
    setError(null);
    try {
      const result = await createPayment({
        amount: Number(order.total),
        method: order.payment_method,
        service_type: 'food',
        object_id: order.id,
      }).unwrap();
      if (result.authorization_url) {
        redirectToCheckout(result.authorization_url, result.kudya_reference);
        return;
      }
      setError(result.customer_message || t('foodPaymentStarted', 'Payment started. Follow the instructions from your provider.'));
    } catch (err) {
      setError(foodErrorMessage(err, t('foodPaymentStartFailed', 'We could not start the payment. Please try again.')));
    }
  };
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p className="flex items-center gap-2 font-semibold text-amber-900">
        <CreditCard className="h-4 w-4" aria-hidden />
        {t('foodPaymentPending', 'Payment not confirmed yet')}
      </p>
      <p className="mt-1 text-sm text-amber-800">
        {t('foodPaymentPendingHint', 'The restaurant starts once Kudya confirms your payment with the provider.')}
      </p>
      <button
        type="button"
        onClick={() => void pay()}
        disabled={isLoading}
        className="mt-3 rounded-full bg-food px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isLoading ? t('foodLoading', 'Loading…') : t('foodPayNow', 'Pay now')}
      </button>
      {error ? <p className="mt-2 text-sm text-amber-900">{error}</p> : null}
    </div>
  );
}

export default function OrderDetailScreen({ orderId }: { orderId: number }) {
  const { t, languageCode } = useTranslation();
  const params = useSearchParams();
  const confirmed = params.get('confirmed') === '1';
  const paymentFailed = params.get('payment') === 'failed';
  const order = useGetOrderQuery(orderId);
  const chatEnabled = Boolean(order.data?.chat_enabled);
  const chat = useGetOrderChatQuery(orderId, { skip: !chatEnabled });
  const reorder = useReorder();
  const active = Boolean(order.data && order.data.status !== 'delivered' && order.data.status !== 'cancelled');
  const { live } = useOrderTracking(
    orderId,
    {
      onStatus: () => void order.refetch(),
      onChat: () => {
        if (chatEnabled) void chat.refetch();
      },
    },
    active,
  );

  if (order.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <FoodHeader backHref="/account/orders" />
        <div className="mx-auto max-w-5xl px-4 py-6">
          <FoodSkeletonGrid count={3} variant="row" />
        </div>
      </div>
    );
  }
  if (order.isError || !order.data) {
    const status = (order.error as { status?: number } | undefined)?.status;
    return (
      <div className="min-h-screen bg-slate-50">
        <FoodHeader backHref="/account/orders" />
        <div className="mx-auto max-w-3xl px-4 py-12">
          {status === 404 ? (
            <FoodEmpty
              title={t('foodOrderNotFound', 'We could not find this order on your account')}
              action={
                <Link href="/account/orders" className="rounded-full bg-kudya px-5 py-2 text-sm font-semibold text-white">
                  {t('foodMyOrders', 'My orders')}
                </Link>
              }
            />
          ) : (
            <FoodError onRetry={order.refetch} />
          )}
        </div>
      </div>
    );
  }

  const data = order.data;
  const delivered = data.status === 'delivered';
  const cancelled = data.status === 'cancelled';
  const needsPayment = data.payment_method !== 'cash' && !data.is_paid && UNPAID_STATES.has(data.payment_status) && !cancelled;
  const paymentLabel = data.is_paid
    ? t('foodPaid', 'Paid')
    : data.payment_status === 'cash_on_delivery'
      ? t('foodCashOnDelivery', 'Cash on delivery')
      : t('foodPaymentStatusValue', 'Payment: {status}', { status: data.payment_status });

  return (
    <div className="min-h-screen bg-slate-50">
      <FoodHeader backHref="/account/orders" title={data.number} />
      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6">
        {confirmed && !cancelled ? (
          <section className="flex items-start gap-3 rounded-2xl bg-gradient-to-r from-kudya to-kudya-secondary p-5 text-white shadow-lg" role="status">
            <CheckCircle2 className="h-8 w-8 shrink-0" aria-hidden />
            <div>
              <h1 className="text-xl font-bold">{t('foodOrderPlaced', 'Order placed!')}</h1>
              <p className="text-sm text-white/90">
                {t('foodOrderPlacedHint', 'Order {number} was sent to {store}.', { number: data.number, store: data.store.name })}
              </p>
            </div>
          </section>
        ) : null}
        {paymentFailed ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {t('foodPaymentFollowUp', 'Your order was placed, but the payment did not start. You can pay below.')}
          </p>
        ) : null}
        {needsPayment ? <PayNow order={data} /> : null}
        {data.can_cancel ? <CancelOrder order={data} /> : null}
        {cancelled && data.cancellation_reason ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="status">
            {t('foodCancelledBecause', 'This order was cancelled: {reason}', { reason: data.cancellation_reason })}
          </p>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <Card title={t('foodOrderStatus', 'Order status')}>
              <div className="flex flex-wrap items-center gap-3">
                <OrderStatusBadge status={data.status} />
                {data.eta_minutes ? (
                  <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                    <Clock className="h-4 w-4" aria-hidden />
                    {t('foodEtaMinutes', 'About {minutes} min', { minutes: data.eta_minutes })}
                  </span>
                ) : null}
                {active ? (
                  <span className={`text-xs ${live ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {live ? t('foodLiveUpdates', 'Live updates on') : t('foodAutoRefresh', 'Refreshing automatically')}
                  </span>
                ) : null}
              </div>
              <OrderTimeline steps={data.steps} cancelled={cancelled} />
              {data.secret_pin && data.fulfilment_type === 'delivery' ? (
                <p className="flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-sm text-violet-900">
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                  {t('foodDeliveryPin', 'Share PIN {pin} with your courier only when you receive your food.', { pin: data.secret_pin })}
                </p>
              ) : null}
            </Card>

            {data.driver ? (
              <Card title={t('foodYourCourier', 'Your courier')} icon={<Bike className="h-4 w-4 text-kudya" aria-hidden />}>
                <p className="font-medium text-slate-900">{data.driver.name}</p>
                {data.driver.vehicle ? <p className="text-sm text-slate-600">{data.driver.vehicle}</p> : null}
                {data.driver_location ? (
                  <p className="text-xs text-slate-500">{t('foodCourierLocationShared', 'Courier location is being shared with you.')}</p>
                ) : null}
              </Card>
            ) : null}

            {data.chat_enabled ? <ChatPanel orderId={data.id} /> : null}
            {data.can_rate ? <RatingForm order={data} /> : null}
            {data.rating ? (
              <Card title={t('foodYourRating', 'Your rating')}>
                <p className="flex items-center gap-1 text-sm text-slate-700">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                  {data.rating.store_rating}/5 {data.rating.comment ? `· ${data.rating.comment}` : ''}
                </p>
              </Card>
            ) : null}
            {delivered || (cancelled && data.is_paid) ? <ReportIssue order={data} /> : null}
          </div>

          <aside className="space-y-5">
            <Card title={data.store.name}>
              <ul className="divide-y divide-slate-100 text-sm">
                {data.lines.map((line) => (
                  <li key={line.id} className="flex justify-between gap-3 py-2">
                    <span>
                      <span className="font-medium text-slate-900">
                        {Number(line.quantity)} × {line.name}
                      </span>
                      {line.addons.length ? (
                        <span className="block text-xs text-slate-500">{line.addons.map((addon) => addon.name).join(', ')}</span>
                      ) : null}
                      {line.special_instructions ? (
                        <span className="block text-xs italic text-slate-500">“{line.special_instructions}”</span>
                      ) : null}
                    </span>
                    <span className="shrink-0">{formatMoney(line.subtotal, data.currency, languageCode)}</span>
                  </li>
                ))}
              </ul>
              <CheckoutSummary
                currency={data.currency}
                subtotal={data.subtotal}
                deliveryFee={data.delivery_fee}
                discount={data.discount_amount}
                total={data.total}
                pickup={data.fulfilment_type === 'pickup'}
              />
              <p className="text-sm text-slate-600">{paymentLabel}</p>
              <p className="text-sm text-slate-600">
                {data.fulfilment_type === 'pickup'
                  ? t('foodPickupFromRestaurant', 'Pickup from the restaurant')
                  : `${t('foodDeliverTo', 'Deliver to')}: ${data.address || '—'}`}
              </p>
              <p className="text-xs text-slate-400">{new Date(data.created_at).toLocaleString(languageCode)}</p>
            </Card>
            <div className="flex flex-wrap gap-2">
              {data.receipt_url ? (
                <a
                  href={data.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  <FileText className="h-4 w-4" aria-hidden />
                  {t('foodDownloadReceipt', 'Download receipt')}
                </a>
              ) : (
                <span className="text-xs text-slate-400">{t('foodReceiptPending', 'Your receipt will be available shortly.')}</span>
              )}
              {data.can_reorder ? (
                <button
                  type="button"
                  disabled={reorder.isLoading}
                  onClick={() => void reorder.run(data.id, t('foodReorderFailed', 'We could not reorder this.'))}
                  className="inline-flex items-center gap-1 rounded-full bg-kudya px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden />
                  {t('foodReorder', 'Reorder')}
                </button>
              ) : null}
            </div>
            {reorder.error ? <p className="text-sm text-red-600">{reorder.error}</p> : null}
            {reorder.result?.unavailable.length ? (
              <p className="text-sm text-amber-700">
                {t('foodReorderPartial', 'Some items could not be added:')} {reorder.result.unavailable.map((row) => row.name).join(', ')}
              </p>
            ) : null}
          </aside>
        </div>
      </main>
    </div>
  );
}
