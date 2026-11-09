'use client';

import type { ReactNode } from 'react';
import withAuth from '@/components/ProtectedPage';
import PartnerWorkspace from '@/features/food/partner/PartnerWorkspace';

function PartnerFoodLayout({ children }: { children: ReactNode }) {
  return <PartnerWorkspace>{children}</PartnerWorkspace>;
}

export default withAuth(PartnerFoodLayout);
