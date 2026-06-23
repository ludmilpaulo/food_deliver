"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import type { AppNotification } from "@/types/notification";
import { useDoctorTranslation } from "@/hooks/useDoctorTranslation";
import {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/redux/slices/notificationApi";

function formatWhen(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  onNewBooking?: (notification: AppNotification) => void;
};

export default function DoctorNotificationBell({ onNewBooking }: Props) {
  const { dt } = useDoctorTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const seenBookingIdsRef = useRef<Set<string>>(new Set());

  const { data: notifications = [], refetch } = useGetNotificationsQuery(
    { module: "doctor" },
    { pollingInterval: 45000 },
  );
  const { data: unreadData } = useGetUnreadNotificationCountQuery(
    { module: "doctor" },
    { pollingInterval: 45000 },
  );
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const unreadCount = unreadData?.unreadCount ?? 0;

  const bookingAlerts = useMemo(
    () => notifications.filter((item) => item.notificationType === "new_booking").slice(0, 3),
    [notifications],
  );

  useEffect(() => {
    for (const notification of notifications) {
      if (notification.notificationType !== "new_booking" || notification.isRead) continue;
      if (seenBookingIdsRef.current.has(notification.id)) continue;
      seenBookingIdsRef.current.add(notification.id);
      onNewBooking?.(notification);
    }
  }, [notifications, onNewBooking]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = () => {
    setOpen((value) => !value);
    void refetch();
  };

  const handleMarkRead = async (id: string) => {
    await markRead(id);
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
        aria-label={dt("notifications")}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="font-semibold text-slate-900">{dt("notifications")}</p>
              <p className="text-xs text-slate-500">{unreadCount} {dt("unreadCount")}</p>
            </div>
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline"
            >
              <CheckCheck className="h-4 w-4" />
              {dt("markAllRead")}
            </button>
          </div>

          {bookingAlerts.length > 0 && (
            <div className="border-b border-slate-100 bg-teal-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">{dt("newBookingsSection")}</p>
              <div className="mt-2 space-y-2">
                {bookingAlerts.map((item) => (
                  <div key={item.id} className="rounded-xl border border-teal-100 bg-white px-3 py-2 text-sm">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="text-slate-600">{item.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ul className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-slate-500">{dt("noNotificationsYet")}</li>
            ) : (
              notifications.map((item) => (
                <li key={item.id} className={`border-b border-slate-50 px-4 py-3 ${item.isRead ? "bg-white" : "bg-teal-50/40"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                      <p className="mt-1 text-xs text-slate-400">{formatWhen(item.createdAt)}</p>
                      {item.actionUrl && (
                        <Link
                          href={item.actionUrl.replace(/^https?:\/\/[^/]+/, "") || "/dashboard/doctor"}
                          className="mt-2 inline-block text-xs font-semibold text-teal-700 hover:underline"
                          onClick={() => setOpen(false)}
                        >
                          {dt("openAction")}
                        </Link>
                      )}
                    </div>
                    {!item.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(item.id)}
                        className="shrink-0 text-xs font-semibold text-teal-700 hover:underline"
                      >
                        {dt("readAction")}
                      </button>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
