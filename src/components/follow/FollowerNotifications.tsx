"use client";

import { useEffect } from "react";

type PendingNotificationResponse = {
  pending: boolean;
  notification?: {
    postId: string;
    title: string;
    body: string;
    url: string;
  };
};

const POLL_INTERVAL_MS = 10000;
const LOCAL_TEST_FOLLOWER_KEY = "local_test_follower_endpoint";

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

    const debugPollingEnabled =
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1") &&
      new URLSearchParams(window.location.search).get("followDebug") === "1";

    if (!debugPollingEnabled) {
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

        await registration.showNotification(data.notification.title, {
          body: data.notification.body,
          data: {
            url: data.notification.url,
          },
        });

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
