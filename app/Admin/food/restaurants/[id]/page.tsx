import { notFound } from 'next/navigation';
import { AdminRestaurantDetailScreen } from '@/features/food/admin/screens/AdminRestaurantsScreen';

export default async function AdminFoodRestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const restaurantId = Number(id);
  if (!Number.isSafeInteger(restaurantId) || restaurantId <= 0) notFound();
  return <AdminRestaurantDetailScreen id={restaurantId} />;
}
