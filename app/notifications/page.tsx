'use client';

import Link from 'next/link';
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@/redux/slices/notificationApi';
import { useTranslation } from '@/hooks/useTranslation';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { data: notifications = [], isLoading, isError, refetch } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('notifications.title', 'Notifications')}</h1>
          <p className="mt-2 text-slate-600">
            {t('notificationsSubtitle', 'Order updates, bookings, payments, and platform alerts.')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => markAllRead()}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          {t('markAllRead', 'Mark all read')}
        </button>
      </div>

      {isLoading ? (
        <p className="mt-8 text-slate-600">{t('loading', 'Loading…')}</p>
      ) : isError ? (
        <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6">
          <p className="text-red-700">{t('notificationsLoadError', 'Could not load notifications.')}</p>
          <button type="button" onClick={() => refetch()} className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-white">
            {t('common.retry', 'Retry')}
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">{t('noNotifications', 'You have no notifications yet.')}</p>
          <Link href="/orders" className="mt-4 inline-block text-sky-700">
            {t('orders.trackOrder', 'Track orders')}
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`rounded-2xl border p-4 shadow-sm ${
                notification.isRead ? 'border-slate-100 bg-white' : 'border-sky-100 bg-sky-50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">{notification.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {notification.createdAt
                      ? new Date(notification.createdAt).toLocaleString()
                      : ""}
                  </p>
                </div>
                {!notification.isRead ? (
                  <button
                    type="button"
                    onClick={() => markRead(notification.id)}
                    className="text-sm font-semibold text-sky-700"
                  >
                    {t('markRead', 'Mark read')}
                  </button>
                ) : null}
              </div>
              {notification.actionUrl ? (
                <Link href={notification.actionUrl} className="mt-3 inline-block text-sm text-sky-700">
                  {t('viewDetails', 'View details')}
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
