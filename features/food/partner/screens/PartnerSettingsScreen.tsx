'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { foodErrorMessage } from '../../api/foodApi';
import { FoodError, FoodSkeletonGrid } from '../../components/FoodStates';
import { Panel } from '../../components/WorkspaceShell';
import {
  useCreatePartnerHourMutation,
  useCreatePartnerPromotionMutation,
  useDeletePartnerHourMutation,
  useGetPartnerHoursQuery,
  useGetPartnerPromotionsQuery,
  useGetPartnerStoreQuery,
  useUpdatePartnerPromotionMutation,
  useUpdatePartnerStoreMutation,
} from '../partnerApi';
import { useCan } from '../PartnerWorkspace';
import type { PartnerStoreSettings } from '../types';

const DAYS: Array<[number, string, string]> = [
  [1, 'fpMonday', 'Monday'],
  [2, 'fpTuesday', 'Tuesday'],
  [3, 'fpWednesday', 'Wednesday'],
  [4, 'fpThursday', 'Thursday'],
  [5, 'fpFriday', 'Friday'],
  [6, 'fpSaturday', 'Saturday'],
  [7, 'fpSunday', 'Sunday'],
];

/** "13:30" (input type=time) → "01:30 PM" (the format OpeningHour stores). */
export function toTwelveHour(value: string): string {
  const [hours, minutes] = value.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

function StoreForm({ store }: { store: PartnerStoreSettings }) {
  const { t } = useTranslation();
  const [update, { isLoading }] = useUpdatePartnerStoreMutation();
  const [values, setValues] = useState(store);
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => setValues(store), [store]);

  const set = <K extends keyof PartnerStoreSettings>(key: K, value: PartnerStoreSettings[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    try {
      await update({
        accepting_orders: values.accepting_orders,
        supports_pickup: values.supports_pickup,
        preparation_time_minutes: values.preparation_time_minutes,
        minimum_order_amount: values.minimum_order_amount,
        delivery_radius_km: values.delivery_radius_km,
        price_level: values.price_level,
        promo_text: values.promo_text,
        description: values.description,
        phone: values.phone,
        address: values.address,
      }).unwrap();
      setMessage(t('fpSaved', 'Saved.'));
    } catch (err) {
      setMessage(foodErrorMessage(err, t('fpSaveFailed', 'Could not save the changes.')));
    }
  };

  const field = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm';
  return (
    <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={values.accepting_orders} onChange={(event) => set('accepting_orders', event.target.checked)} />
        {t('fpAcceptingOrders', 'Accepting orders')}
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={values.supports_pickup} onChange={(event) => set('supports_pickup', event.target.checked)} />
        {t('fpOfferPickup', 'Offer customer pickup')}
      </label>
      <label className="space-y-1 text-sm">
        <span>{t('fpDefaultPrep', 'Default preparation time (min)')}</span>
        <input type="number" min={1} max={240} value={values.preparation_time_minutes} onChange={(event) => set('preparation_time_minutes', Number(event.target.value))} className={field} />
      </label>
      <label className="space-y-1 text-sm">
        <span>{t('foodMinimumOrder', 'Minimum order')}</span>
        <input type="number" min={0} step="0.01" value={values.minimum_order_amount} onChange={(event) => set('minimum_order_amount', event.target.value)} className={field} />
      </label>
      <label className="space-y-1 text-sm">
        <span>{t('fpDeliveryRadius', 'Delivery radius (km)')}</span>
        <input type="number" min={0} step="0.1" value={values.delivery_radius_km} onChange={(event) => set('delivery_radius_km', event.target.value)} className={field} />
      </label>
      <label className="space-y-1 text-sm">
        <span>{t('foodPriceRange', 'Price range')}</span>
        <select value={values.price_level} onChange={(event) => set('price_level', Number(event.target.value))} className={field}>
          <option value={1}>$</option>
          <option value={2}>$$</option>
          <option value={3}>$$$</option>
        </select>
      </label>
      <label className="space-y-1 text-sm">
        <span>{t('fpPhone', 'Phone')}</span>
        <input value={values.phone} onChange={(event) => set('phone', event.target.value)} className={field} />
      </label>
      <label className="space-y-1 text-sm">
        <span>{t('fpAddress', 'Address')}</span>
        <input value={values.address} onChange={(event) => set('address', event.target.value)} className={field} />
      </label>
      <label className="space-y-1 text-sm md:col-span-2">
        <span>{t('fpPromoText', 'Promotion banner text')}</span>
        <input maxLength={120} value={values.promo_text} onChange={(event) => set('promo_text', event.target.value)} className={field} />
      </label>
      <label className="space-y-1 text-sm md:col-span-2">
        <span>{t('fpDescription', 'Description')}</span>
        <textarea rows={3} value={values.description} onChange={(event) => set('description', event.target.value)} className={field} />
      </label>
      <div className="flex items-center gap-3 md:col-span-2">
        <button type="submit" disabled={isLoading} className="rounded-full bg-kudya px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {t('fpSaveChanges', 'Save changes')}
        </button>
        {message ? <span className="text-sm text-slate-600">{message}</span> : null}
      </div>
    </form>
  );
}

function HoursEditor() {
  const { t } = useTranslation();
  const hours = useGetPartnerHoursQuery();
  const [create, { isLoading }] = useCreatePartnerHourMutation();
  const [remove] = useDeletePartnerHourMutation();
  const [day, setDay] = useState(1);
  const [from, setFrom] = useState('09:00');
  const [to, setTo] = useState('21:00');
  const [closed, setClosed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await create({ day, from_hour: closed ? '' : toTwelveHour(from), to_hour: closed ? '' : toTwelveHour(to), is_closed: closed }).unwrap();
    } catch (err) {
      setError(foodErrorMessage(err, t('fpSaveFailed', 'Could not save the changes.')));
    }
  };

  if (hours.isLoading) return <FoodSkeletonGrid count={2} variant="row" />;
  if (hours.isError) return <FoodError onRetry={hours.refetch} />;
  return (
    <div className="space-y-3">
      <ul className="divide-y divide-slate-100 text-sm">
        {(hours.data ?? []).length === 0 ? (
          <li className="py-2 text-slate-500">{t('fpNoHours', 'No hours yet: customers see you as open while accepting orders.')}</li>
        ) : (
          (hours.data ?? []).map((row) => (
            <li key={row.id} className="flex items-center justify-between py-2">
              <span className="font-medium text-slate-900">{t(...(DAYS.find(([value]) => value === row.day_number)?.slice(1) as [string, string]))}</span>
              <span className="text-slate-600">{row.is_closed ? t('foodClosed', 'Closed') : `${row.from_hour} – ${row.to_hour}`}</span>
              <button type="button" onClick={() => void remove(row.id)} aria-label={t('fpDelete', 'Delete')} className="text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))
        )}
      </ul>
      <form onSubmit={add} className="flex flex-wrap items-end gap-2 text-sm">
        <select value={day} onChange={(event) => setDay(Number(event.target.value))} className="rounded-xl border border-slate-200 px-3 py-2" aria-label={t('fpDay', 'Day')}>
          {DAYS.map(([value, key, fallback]) => (
            <option key={value} value={value}>
              {t(key, fallback)}
            </option>
          ))}
        </select>
        <input type="time" value={from} disabled={closed} onChange={(event) => setFrom(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2" aria-label={t('fpOpens', 'Opens')} />
        <input type="time" value={to} disabled={closed} onChange={(event) => setTo(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2" aria-label={t('fpCloses', 'Closes')} />
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={closed} onChange={(event) => setClosed(event.target.checked)} /> {t('foodClosed', 'Closed')}
        </label>
        <button type="submit" disabled={isLoading} className="rounded-full bg-kudya px-4 py-2 font-semibold text-white disabled:opacity-50">
          {t('fpAddHours', 'Add')}
        </button>
      </form>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function PromotionsEditor() {
  const { t } = useTranslation();
  const promotions = useGetPartnerPromotionsQuery();
  const [create, { isLoading }] = useCreatePartnerPromotionMutation();
  const [update] = useUpdatePartnerPromotionMutation();
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  const add = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      await create({
        product: null,
        title: String(form.get('title') || ''),
        discount_type: String(form.get('discount_type') || 'percentage'),
        discount_value: String(form.get('discount_value') || '0'),
        start_date: String(form.get('start_date') || today),
        end_date: String(form.get('end_date') || today),
        is_active: true,
      }).unwrap();
      event.currentTarget.reset();
    } catch (err) {
      setError(foodErrorMessage(err, t('fpSaveFailed', 'Could not save the changes.')));
    }
  };

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-slate-100 text-sm">
        {(promotions.data ?? []).map((promo) => (
          <li key={promo.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
            <span className="font-medium text-slate-900">{promo.title}</span>
            <span className="text-slate-600">
              {promo.discount_type} {promo.discount_value} · {promo.start_date} → {promo.end_date}
            </span>
            <label className="flex items-center gap-1 text-xs">
              <input type="checkbox" checked={promo.is_active} onChange={() => void update({ id: promo.id, is_active: !promo.is_active })} />
              {t('fpActive', 'Active')}
            </label>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="grid gap-2 text-sm md:grid-cols-6">
        <input name="title" required placeholder={t('fpPromoTitle', 'Title, e.g. 10% off lunch')} className="rounded-xl border border-slate-200 px-3 py-2 md:col-span-2" />
        <select name="discount_type" className="rounded-xl border border-slate-200 px-3 py-2" aria-label={t('fpDiscountType', 'Type')}>
          <option value="percentage">%</option>
          <option value="fixed">{t('fpFixedAmount', 'Fixed')}</option>
        </select>
        <input name="discount_value" type="number" min="0" step="0.01" required placeholder="10" className="rounded-xl border border-slate-200 px-3 py-2" />
        <input name="start_date" type="date" defaultValue={today} className="rounded-xl border border-slate-200 px-3 py-2" aria-label={t('fpStarts', 'Starts')} />
        <input name="end_date" type="date" defaultValue={today} className="rounded-xl border border-slate-200 px-3 py-2" aria-label={t('fpEnds', 'Ends')} />
        <button type="submit" disabled={isLoading} className="rounded-full bg-kudya px-4 py-2 font-semibold text-white disabled:opacity-50 md:col-span-6 md:justify-self-start">
          {t('fpAddPromotion', 'Add promotion')}
        </button>
      </form>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export default function PartnerSettingsScreen() {
  const { t } = useTranslation();
  const canStore = useCan('manage_store');
  const canHours = useCan('manage_hours');
  const canMenu = useCan('manage_menu');
  const store = useGetPartnerStoreQuery();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-900">{t('fpSettings', 'Restaurant settings')}</h1>
      {canStore ? (
        <Panel title={t('fpProfile', 'Profile and delivery options')}>
          {store.isLoading ? <FoodSkeletonGrid count={2} variant="row" /> : store.isError || !store.data ? <FoodError onRetry={store.refetch} /> : <StoreForm store={store.data} />}
        </Panel>
      ) : null}
      {canHours ? (
        <Panel title={t('foodOpeningHours', 'Opening hours')}>
          <HoursEditor />
        </Panel>
      ) : null}
      {canMenu ? (
        <Panel title={t('fpPromotions', 'Promotions')}>
          <PromotionsEditor />
        </Panel>
      ) : null}
    </div>
  );
}
