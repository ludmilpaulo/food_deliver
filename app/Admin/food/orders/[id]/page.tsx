import { notFound } from 'next/navigation';
import { AdminOrderDetailScreen } from '@/features/food/admin/screens/AdminOrdersScreen';

export default async function AdminFoodOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isSafeInteger(orderId) || orderId <= 0) notFound();
  return <AdminOrderDetailScreen id={orderId} />;
}
