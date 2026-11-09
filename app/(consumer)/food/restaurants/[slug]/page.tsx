import { notFound } from 'next/navigation';
import RestaurantDetailScreen from '@/features/food/consumer/RestaurantDetailScreen';
import { parseRestaurantSlug } from '@/features/food/lib/slug';

export default async function FoodRestaurantPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const storeId = parseRestaurantSlug(slug);
  if (!storeId) notFound();
  return <RestaurantDetailScreen storeId={storeId} />;
}
