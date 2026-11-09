'use client';

import type { ReactNode } from 'react';
import AdminFoodWorkspace from '@/features/food/admin/AdminFoodWorkspace';

export default function AdminFoodLayout({ children }: { children: ReactNode }) {
  return <AdminFoodWorkspace>{children}</AdminFoodWorkspace>;
}
