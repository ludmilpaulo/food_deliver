import { Suspense } from 'react';
import RestaurantListScreen from '@/features/food/consumer/RestaurantListScreen';
import PageSpinner from '@/components/ui/PageSpinner';

export default function FoodRestaurantsPage() {
  return (
    <Suspense fallback={<PageSpinner fullPage />}>
      <RestaurantListScreen />
    </Suspense>
  );
}
