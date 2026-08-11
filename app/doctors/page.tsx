'use client';

import FindDoctorsPage from '@/components/healthcare/FindDoctorsPage';
import PlatformServiceGate from '@/components/platform/PlatformServiceGate';

export default function DoctorsPage() {
  return (
    <PlatformServiceGate slug="doctors">
      <FindDoctorsPage />
    </PlatformServiceGate>
  );
}
