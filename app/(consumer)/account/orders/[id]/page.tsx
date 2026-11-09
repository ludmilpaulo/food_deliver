'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import withAuth from '@/components/ProtectedPage';
import { useTranslation } from '@/hooks/useTranslation';
import PageSpinner from '@/components/ui/PageSpinner';
import { FoodEmpty } from '@/features/food/components/FoodStates';
import OrderDetailScreen from '@/features/food/consumer/OrderDetailScreen';

function OrderDetailPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);
  if (!Number.isSafeInteger(orderId) || orderId <= 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <FoodEmpty title={t('foodOrderNotFound', 'We could not find this order on your account')} />
      </div>
    );
  }
  return (
    <Suspense fallback={<PageSpinner fullPage />}>
      <OrderDetailScreen orderId={orderId} />
    </Suspense>
  );
}

export default withAuth(OrderDetailPage);
