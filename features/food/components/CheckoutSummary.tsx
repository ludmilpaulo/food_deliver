'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { formatMoney } from '../lib/money';

type Props = {
  currency: string;
  subtotal: string | number;
  deliveryFee: string | number;
  discount: string | number;
  promotionDiscount?: string | number;
  total: string | number;
  pickup?: boolean;
  loading?: boolean;
};

function Row({ label, value, tone = '' }: { label: string; value: string; tone?: string }) {
  return (
    <div className={`flex justify-between text-sm ${tone}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function CheckoutSummary({
  currency,
  subtotal,
  deliveryFee,
  discount,
  promotionDiscount = 0,
  total,
  pickup = false,
  loading = false,
}: Props) {
  const { t, languageCode } = useTranslation();
  const money = (value: string | number) => formatMoney(value, currency, languageCode);
  return (
    <dl className={`space-y-2 text-slate-700 ${loading ? 'opacity-60' : ''}`} aria-busy={loading}>
      <Row label={t('foodSubtotal', 'Subtotal')} value={money(subtotal)} />
      {Number(promotionDiscount) > 0 ? (
        <Row
          label={t('foodPromotionSavings', 'Restaurant promotions')}
          value={`-${money(promotionDiscount)}`}
          tone="text-emerald-700"
        />
      ) : null}
      <Row
        label={pickup ? t('foodPickupFee', 'Pickup') : t('foodDeliveryFee', 'Delivery fee')}
        value={Number(deliveryFee) > 0 ? money(deliveryFee) : t('foodFree', 'Free')}
      />
      {Number(discount) > 0 ? (
        <Row label={t('foodCouponDiscount', 'Coupon discount')} value={`-${money(discount)}`} tone="text-emerald-700" />
      ) : null}
      <Row label={t('foodTaxes', 'Taxes')} value={t('foodTaxesIncluded', 'Included in prices')} tone="text-slate-500" />
      <div className="flex justify-between border-t border-slate-100 pt-3 text-lg font-bold text-slate-900">
        <dt>{t('foodTotal', 'Total')}</dt>
        <dd>{money(total)}</dd>
      </div>
    </dl>
  );
}
