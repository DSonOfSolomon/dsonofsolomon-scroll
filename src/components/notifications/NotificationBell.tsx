"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiBell } from "react-icons/fi";
import {
  FOLLOW_STATE_CHANGE_EVENT,
  LOCAL_TEST_FOLLOWER_KEY,
} from "@/components/follow/FollowButton";

type NotificationResponse = {
  unreadCount: number;
};

async function fetchUnreadCount() {
  const endpoint = window.localStorage.getItem(LOCAL_TEST_FOLLOWER_KEY);

  if (!endpoint) {
    return 0;
  }

  const response = await fetch("/api/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ endpoint }),
  });

  if (!response.ok) {
    return 0;
  }

  const data = (await response.json()) as NotificationResponse;
  return data.unreadCount ?? 0;
}

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function syncUnreadCount() {
      const nextUnreadCount = await fetchUnreadCount();

      if (!cancelled) {
        setUnreadCount(nextUnreadCount);
      }
    }

    void syncUnreadCount();

    window.addEventListener(FOLLOW_STATE_CHANGE_EVENT, syncUnreadCount);
    window.addEventListener("focus", syncUnreadCount);

    return () => {
      cancelled = true;
      window.removeEventListener(FOLLOW_STATE_CHANGE_EVENT, syncUnreadCount);
      window.removeEventListener("focus", syncUnreadCount);
    };
  }, []);

  return (
    <Link
      href="/notifications"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/5 hover:text-white"
      aria-label={
        unreadCount > 0
          ? `${unreadCount} unread notifications`
          : "Notifications"
      }
    >
      <FiBell size={18} />
      {unreadCount > 0 ? (
        <span className="absolute right-1.5 top-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-[#8a6a2f] px-1 text-[0.65rem] font-semibold leading-4 text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
