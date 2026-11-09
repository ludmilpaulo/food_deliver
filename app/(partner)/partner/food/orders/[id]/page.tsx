import { notFound } from 'next/navigation';
import PartnerOrderDetailScreen from '@/features/food/partner/screens/PartnerOrderDetailScreen';

export default async function PartnerFoodOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isSafeInteger(orderId) || orderId <= 0) notFound();
  return <PartnerOrderDetailScreen orderId={orderId} />;
}
