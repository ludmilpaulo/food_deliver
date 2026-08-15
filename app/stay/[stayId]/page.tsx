'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function StayDetailPage() {
  const params = useParams<{ stayId: string }>();
  const router = useRouter();

  useEffect(() => {
    if (params.stayId) {
      router.replace(`/properties/${params.stayId}`);
    }
  }, [params.stayId, router]);

  return <div className="px-4 py-10 text-slate-500">Loading…</div>;
}
