import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ doctorId: string }>;
};

export default async function HealthDoctorDetailRedirectPage({ params }: Props) {
  const { doctorId } = await params;
  redirect(`/Doctors/${doctorId}`);
}
