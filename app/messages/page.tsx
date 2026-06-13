'use client';

import PlatformSupportChat from '@/components/support/PlatformSupportChat';
import { useTranslation } from '@/hooks/useTranslation';

export default function MessagesPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">{t('messages', 'Messages')}</h1>
      <p className="mt-2 text-slate-600">
        {t('messagesSubtitle', 'Contact Kudya support or follow up on your orders and bookings.')}
      </p>
      <div className="mt-8">
        <PlatformSupportChat />
      </div>
    </div>
  );
}
