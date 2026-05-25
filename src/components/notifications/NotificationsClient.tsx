"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LOCAL_TEST_FOLLOWER_KEY } from "@/components/follow/FollowButton";

type ReaderNotification = {
  id: string;
  title: string;
  body: string;
  href: string;
  readAt: string | null;
  createdAt: string;
};

type NotificationResponse = {
  notifications: ReaderNotification[];
  unreadCount: number;
};

async function requestNotifications(payload: Record<string, unknown> = {}) {
  const endpoint = window.localStorage.getItem(LOCAL_TEST_FOLLOWER_KEY);

  if (!endpoint) {
    return {
      notifications: [],
      unreadCount: 0,
    } satisfies NotificationResponse;
  }

  const response = await fetch("/api/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ endpoint, ...payload }),
  });

  if (!response.ok) {
    return {
      notifications: [],
      unreadCount: 0,
    } satisfies NotificationResponse;
  }

  return (await response.json()) as NotificationResponse;
}

function formatNotificationDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function NotificationsClient() {
  const [notifications, setNotifications] = useState<ReaderNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function syncNotifications() {
      const data = await requestNotifications();

      if (!cancelled) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
        setLoaded(true);
      }
    }

    void syncNotifications();

    return () => {
      cancelled = true;
    };
  }, []);

  async function markAllRead() {
    const data = await requestNotifications({ markAllRead: true });
    setNotifications(data.notifications);
    setUnreadCount(data.unreadCount);
  }

  async function markRead(id: string) {
    const data = await requestNotifications({ markReadId: id });
    setNotifications(data.notifications);
    setUnreadCount(data.unreadCount);
  }

  return (
    <section className="mt-10">
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          {unreadCount === 1 ? "1 unread update" : `${unreadCount} unread updates`}
        </p>
        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={markAllRead}
            className="cursor-pointer text-sm font-medium text-[#0a192f] transition-colors hover:text-[#13294b]"
          >
            Mark all read
          </button>
        ) : null}
      </div>

      {loaded && notifications.length === 0 ? (
        <div className="rounded-[1.25rem] border border-gray-200 bg-white px-6 py-10 text-center">
          <h2 className="text-lg font-semibold tracking-tight text-gray-950">
            No updates yet
          </h2>
          <p className="mt-3 text-sm leading-7 text-gray-600">
            New public chapters will appear here after you follow.
          </p>
        </div>
      ) : (
        <div className="rounded-[1.25rem] border border-gray-200 bg-white shadow-sm">
          {notifications.map((notification) => (
            <Link
              key={notification.id}
              href={notification.href}
              onClick={() => {
                void markRead(notification.id);
              }}
              className="block border-t border-gray-100 px-5 py-5 no-underline first:border-t-0 transition-colors hover:bg-gray-50 md:px-7"
            >
              <div className="flex gap-4">
                <span
                  className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${
                    notification.readAt ? "bg-gray-200" : "bg-[#8a6a2f]"
                  }`}
                />
                <div>
                  <p className="text-base font-semibold tracking-tight text-gray-950">
                    {notification.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {notification.body}
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-gray-400">
                    {formatNotificationDate(notification.createdAt)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
