'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { foodErrorMessage } from '../../api/foodApi';
import { FoodError, FoodSkeletonGrid } from '../../components/FoodStates';
import { Panel } from '../../components/WorkspaceShell';
import {
  useCreateFoodPromoMutation,
  useGetFoodConfigQuery,
  useGetFoodPromosQuery,
  useUpdateFoodConfigMutation,
  useUpdateFoodPromoMutation,
} from '../adminApi';

export default function AdminConfigScreen() {
  const { t } = useTranslation();
  const config = useGetFoodConfigQuery();
  const promos = useGetFoodPromosQuery();
  const [save, { isLoading }] = useUpdateFoodConfigMutation();
  const [createPromo] = useCreateFoodPromoMutation();
  const [updatePromo] = useUpdateFoodPromoMutation();
  const [allowed, setAllowed] = useState<number[]>([]);
  const [fees, setFees] = useState<Record<number, string>>({});
  const [commissions, setCommissions] = useState<Record<number, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!config.data) return;
    setAllowed(config.data.module.allowed_country_ids);
    setFees(Object.fromEntries(config.data.delivery_fees.filter((row) => row.country_id).map((row) => [row.country_id as number, row.delivery_base_fee])));
    setCommissions(
      Object.fromEntries(
        config.data.commissions.filter((row) => row.country_id && !row.transaction_type).map((row) => [row.country_id as number, row.value]),
      ),
    );
  }, [config.data]);

  if (config.isLoading) return <FoodSkeletonGrid count={3} variant="row" />;
  if (config.isError || !config.data) {
    const status = (config.error as { status?: number } | undefined)?.status;
    return <FoodError message={status === 403 ? t('faNoPermission', 'Your role cannot view this section.') : undefined} onRetry={config.refetch} />;
  }
  const data = config.data;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    try {
      await save({
        allowed_country_ids: allowed,
        delivery_fees: Object.entries(fees)
          .filter(([, value]) => value !== '')
          .map(([country, value]) => ({ country_id: Number(country), delivery_base_fee: value })),
        commissions: Object.entries(commissions)
          .filter(([, value]) => value !== '')
          .map(([country, value]) => ({ country_id: Number(country), value, fee_type: 'percentage' })),
      }).unwrap();
      setMessage(t('faConfigSaved', 'Configuration saved and audited.'));
    } catch (err) {
      setMessage(foodErrorMessage(err, t('faConfigFailed', 'The configuration could not be saved.')));
    }
  };

  const addPromo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setMessage(null);
    try {
      await createPromo({
        code: String(form.get('code') || ''),
        title: String(form.get('title') || ''),
        discount_type: (String(form.get('discount_type')) as 'percent' | 'fixed') || 'percent',
        discount_value: String(form.get('discount_value') || '0'),
        min_order: String(form.get('min_order') || '0'),
        per_user_limit: Number(form.get('per_user_limit') || 1),
        is_active: true,
      }).unwrap();
      event.currentTarget.reset();
    } catch (err) {
      setMessage(foodErrorMessage(err, t('faConfigFailed', 'The configuration could not be saved.')));
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-900">{t('faConfig', 'Configuration')}</h1>
      <form onSubmit={submit} className="space-y-5">
        <Panel title={t('faCountryAvailability', 'Countries, delivery fees and commission')}>
          <p className="text-xs text-slate-500">{t('faCountryHint', 'Food is offered only in checked countries. Leave all unchecked to allow every country.')}</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">{t('faCountry', 'Country')}</th>
                  <th>{t('faFoodEnabled', 'Food enabled')}</th>
                  <th>{t('faDeliveryFee', 'Base delivery fee')}</th>
                  <th>{t('faCommission', 'Restaurant commission %')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.countries.map((country) => (
                  <tr key={country.id}>
                    <td className="py-2">{country.name} <span className="text-xs text-slate-400">{country.currency}</span></td>
                    <td>
                      <input
                        type="checkbox"
                        checked={allowed.includes(country.id)}
                        onChange={() => setAllowed((current) => (current.includes(country.id) ? current.filter((id) => id !== country.id) : [...current, country.id]))}
                        aria-label={`${t('faFoodEnabled', 'Food enabled')} ${country.name}`}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={fees[country.id] ?? ''}
                        onChange={(event) => setFees((current) => ({ ...current, [country.id]: event.target.value }))}
                        className="w-28 rounded-lg border border-slate-200 px-2 py-1"
                        aria-label={`${t('faDeliveryFee', 'Base delivery fee')} ${country.name}`}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={commissions[country.id] ?? ''}
                        onChange={(event) => setCommissions((current) => ({ ...current, [country.id]: event.target.value }))}
                        className="w-24 rounded-lg border border-slate-200 px-2 py-1"
                        aria-label={`${t('faCommission', 'Restaurant commission %')} ${country.name}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={isLoading} className="rounded-full bg-kudya px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {t('fpSaveChanges', 'Save changes')}
            </button>
            {message ? <span className="text-sm text-slate-600">{message}</span> : null}
          </div>
          <ul className="list-disc pl-5 text-xs text-slate-500">
            {Object.values(data.notes).map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </Panel>
      </form>

      <Panel title={t('faPromoCodes', 'Food promo codes')}>
        <ul className="divide-y divide-slate-100 text-sm">
          {(promos.data ?? []).map((promo) => (
            <li key={promo.id} className="flex flex-wrap items-center gap-3 py-2">
              <span className="font-mono font-semibold">{promo.code}</span>
              <span className="flex-1 text-slate-600">
                {promo.title} · {promo.discount_type === 'percent' ? `${promo.discount_value}%` : promo.discount_value} · min {promo.min_order}
              </span>
              <span className="text-xs text-slate-500">{t('faUses', '{count} uses', { count: promo.uses ?? 0 })}</span>
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={promo.is_active} onChange={() => void updatePromo({ id: promo.id, is_active: !promo.is_active })} />
                {t('fpActive', 'Active')}
              </label>
            </li>
          ))}
        </ul>
        <form onSubmit={addPromo} className="grid gap-2 text-sm md:grid-cols-6">
          <input name="code" required placeholder="LUNCH10" className="rounded-xl border border-slate-200 px-3 py-2 uppercase" aria-label={t('faCode', 'Code')} />
          <input name="title" required placeholder={t('faPromoTitle', 'Title')} className="rounded-xl border border-slate-200 px-3 py-2 md:col-span-2" />
          <select name="discount_type" className="rounded-xl border border-slate-200 px-3 py-2" aria-label={t('fpDiscountType', 'Type')}>
            <option value="percent">%</option>
            <option value="fixed">{t('fpFixedAmount', 'Fixed')}</option>
          </select>
          <input name="discount_value" type="number" min="0" step="0.01" required placeholder="10" className="rounded-xl border border-slate-200 px-3 py-2" aria-label={t('faValue', 'Value')} />
          <input name="min_order" type="number" min="0" step="0.01" placeholder={t('faMinOrder', 'Min order')} className="rounded-xl border border-slate-200 px-3 py-2" />
          <button type="submit" className="rounded-full bg-kudya px-4 py-2 font-semibold text-white md:col-span-6 md:justify-self-start">
            {t('faCreatePromo', 'Create promo code')}
          </button>
        </form>
      </Panel>
    </div>
  );
}
