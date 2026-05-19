"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { isTrackablePath } from "@/lib/analytics";

function getOrCreateStorageId(key: string, storage: Storage) {
  const existing = storage.getItem(key);

  if (existing) {
    return existing;
  }

  const nextValue = crypto.randomUUID();
  storage.setItem(key, nextValue);
  return nextValue;
}

function sendPageView(payload: {
  path: string;
  visitorId: string;
  sessionId: string;
}) {
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/page-view", blob);
    return;
  }

  void fetch("/api/analytics/page-view", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    keepalive: true,
  });
}

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || !isTrackablePath(pathname)) {
      return;
    }

    const visitorId = getOrCreateStorageId("analytics_visitor_id", localStorage);
    const sessionId = getOrCreateStorageId("analytics_session_id", sessionStorage);
    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;

    sendPageView({
      path,
      visitorId,
      sessionId,
    });
  }, [pathname, searchParams]);

  return null;
}
