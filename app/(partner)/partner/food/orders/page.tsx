import { Suspense } from 'react';
import PageSpinner from '@/components/ui/PageSpinner';
import PartnerOrdersScreen from '@/features/food/partner/screens/PartnerOrdersScreen';

export default function PartnerFoodOrdersPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <PartnerOrdersScreen />
    </Suspense>
  );
}
