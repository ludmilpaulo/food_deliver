'use client';

import { Suspense } from 'react';
import withAuth from '@/components/ProtectedPage';
import PageSpinner from '@/components/ui/PageSpinner';
import FoodCheckoutScreen from '@/features/food/consumer/FoodCheckoutScreen';

function FoodCheckoutPage() {
  return (
    <Suspense fallback={<PageSpinner fullPage />}>
      <FoodCheckoutScreen />
    </Suspense>
  );
}

export default withAuth(FoodCheckoutPage);
