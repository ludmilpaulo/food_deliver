"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import {
  useGetUnreadNotificationCountQuery,
} from "@/redux/slices/notificationApi";

export default function NotificationBellLink() {
  const { data } = useGetUnreadNotificationCountQuery(undefined, {
    pollingInterval: 60000,
  });
  const unread = data?.unreadCount ?? 0;

  return (
    <Link
      href="/notifications"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-indigo-700 transition hover:bg-indigo-50"
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5" />
      {unread > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
          {unread > 99 ? "99+" : unread}
        </span>
      ) : null}
    </Link>
  );
}
