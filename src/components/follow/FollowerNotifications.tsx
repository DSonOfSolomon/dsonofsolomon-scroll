"use client";

import { useEffect } from "react";

type PendingNotificationResponse = {
  pending: boolean;
  deliveryId?: string;
  notification?: {
    postId: string;
    title: string;
    body: string;
    url: string;
    tag?: string;
    timestamp?: number;
    renotify?: boolean;
  };
};

type ExtendedNotificationOptions = NotificationOptions & {
  renotify?: boolean;
  timestamp?: number;
};

const POLL_INTERVAL_MS = 30000;
const LOCAL_TEST_FOLLOWER_KEY = "local_test_follower_endpoint";
const LAST_SEEN_DELIVERY_KEY = "dsonofsolomon_last_seen_delivery_id";
const DEBUG_PUSH_POLLING_KEY = "dsonofsolomon_debug_push_polling";

export default function FollowerNotifications() {
  useEffect(() => {
    if (
      !("window" in globalThis) ||
      !("Notification" in window) ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    if (Notification.permission !== "granted") {
      return;
    }

    const localFallbackEnabled =
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1") &&
      window.localStorage.getItem(DEBUG_PUSH_POLLING_KEY) === "1";

    if (!localFallbackEnabled) {
      return;
    }

    let cancelled = false;

    async function checkForNotifications() {
      try {
        const registration =
          (await navigator.serviceWorker.getRegistration("/")) ??
          (await navigator.serviceWorker.register("/sw.js"));
        const subscription = await registration?.pushManager.getSubscription();
        const localTestEndpoint = window.localStorage.getItem(
          LOCAL_TEST_FOLLOWER_KEY,
        );
        const endpoint = subscription?.endpoint ?? localTestEndpoint;

        if (!registration || !endpoint || cancelled) {
          return;
        }

        const response = await fetch("/api/followers/pending", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint,
            lastSeenDeliveryId: window.localStorage.getItem(
              LAST_SEEN_DELIVERY_KEY,
            ) ?? undefined,
          }),
        });

        if (!response.ok || cancelled) {
          return;
        }

        const data =
          (await response.json()) as PendingNotificationResponse;

        if (!data.pending || !data.notification || cancelled) {
          return;
        }

        if (data.deliveryId && !window.localStorage.getItem(LAST_SEEN_DELIVERY_KEY)) {
          window.localStorage.setItem(LAST_SEEN_DELIVERY_KEY, data.deliveryId);
          return;
        }

        const notificationOptions: ExtendedNotificationOptions = {
          body: data.notification.body,
          tag: data.notification.tag,
          renotify: data.notification.renotify ?? true,
          timestamp: data.notification.timestamp ?? Date.now(),
          data: {
            url: data.notification.url,
          },
        };

        await registration.showNotification(
          data.notification.title,
          notificationOptions,
        );

        if (data.deliveryId) {
          window.localStorage.setItem(LAST_SEEN_DELIVERY_KEY, data.deliveryId);
        }

        await fetch("/api/followers/ack", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint,
            postId: data.notification.postId,
          }),
        });
      } catch {
        return;
      }
    }

    void checkForNotifications();
    const intervalId = window.setInterval(() => {
      void checkForNotifications();
    }, POLL_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void checkForNotifications();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, []);

  return null;
}
