import { Suspense } from 'react';
import PageSpinner from '@/components/ui/PageSpinner';
import AdminRestaurantsScreen from '@/features/food/admin/screens/AdminRestaurantsScreen';

export default function AdminFoodRestaurantsPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <AdminRestaurantsScreen />
    </Suspense>
  );
}
