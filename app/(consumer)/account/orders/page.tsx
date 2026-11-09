'use client';

import withAuth from '@/components/ProtectedPage';
import OrdersScreen from '@/features/food/consumer/OrdersScreen';

export default withAuth(OrdersScreen);
