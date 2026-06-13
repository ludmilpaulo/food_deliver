'use client';

import { useParams } from 'next/navigation';
import DoctorDetailContent from '@/components/healthcare/DoctorDetailContent';

export default function DoctorDetailPage() {
  const params = useParams<{ doctorId: string }>();
  const doctorId = Number(params.doctorId);

  return <DoctorDetailContent doctorId={doctorId} />;
}
