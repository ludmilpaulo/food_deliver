'use client';

import { useParams } from 'next/navigation';
import BookAppointmentExperience from '@/components/healthcare/BookAppointmentExperience';

export default function HealthDoctorBookPage() {
  const params = useParams<{ doctorId: string }>();
  const doctorId = Number(params.doctorId);

  return <BookAppointmentExperience doctorId={doctorId} />;
}
