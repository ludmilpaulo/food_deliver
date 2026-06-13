'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function HealthDoctorLocationRedirectPage() {
  const params = useParams<{ doctorId: string }>();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/Doctors/${params.doctorId}?section=location`);
  }, [params.doctorId, router]);

  return <div className="flex min-h-[40vh] items-center justify-center text-slate-500">Loading...</div>;
}
