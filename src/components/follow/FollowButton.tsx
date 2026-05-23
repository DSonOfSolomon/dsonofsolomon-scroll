"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiBell, FiCheckCircle, FiX } from "react-icons/fi";
import { getPushSubscriptionOptions } from "@/lib/push";

type FollowButtonProps = {
  className: string;
  children?: React.ReactNode;
};

type FollowState = "idle" | "supported" | "subscribed";
export const LOCAL_TEST_FOLLOWER_KEY = "local_test_follower_endpoint";
export const FOLLOW_STATE_CHANGE_EVENT = "dsonofsolomon-follow-state-change";

function emitFollowStateChanged() {
  window.dispatchEvent(new Event(FOLLOW_STATE_CHANGE_EVENT));
}

function getBlockedNotificationMessage(origin: string, permission: string) {
  return `Notifications are still blocked for ${origin}. Browser permission reads "${permission}". Allow that exact site in browser settings, then click Re-check permission.`;
}

async function getLiveNotificationPermission() {
  if (!("Notification" in window)) {
    return "unsupported" as const;
  }

  if ("permissions" in navigator) {
    try {
      const status = await navigator.permissions.query({
        name: "notifications" as PermissionName,
      });

      if (status.state === "granted" || status.state === "denied") {
        return status.state;
      }
    } catch {
      // Some browsers support notifications but not Permissions API for them.
    }
  }

  return Notification.permission;
}

async function showBrowserNotification(
  registration: ServiceWorkerRegistration,
  options?: {
    title?: string;
    body?: string;
    url?: string;
  },
) {
  await registration.showNotification(
    options?.title ?? "New writing just dropped",
    {
      body:
        options?.body ??
        "Your follow setup is working. Future writings will appear here.",
      data: {
        url: options?.url ?? "/writings",
      },
    },
  );
}

export default function FollowButton({
  className,
  children = "Follow",
}: FollowButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<FollowState>("idle");
  const [message, setMessage] = useState("");
  const [hasLocalTestFollower, setHasLocalTestFollower] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    "unsupported",
  );
  const devMode =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");
  const showLocalTesting =
    devMode &&
    new URLSearchParams(window.location.search).get("followDebug") === "1";

  async function syncSubscriptionState(cancelled: () => boolean) {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      if (!cancelled()) {
        setState("supported");
        setPermission("unsupported");
        setMessage("This browser does not support push notifications.");
      }
      return;
    }

    const livePermission = await getLiveNotificationPermission();
    const liveOrigin = window.location.origin;

    if (livePermission === "unsupported") {
      if (!cancelled()) {
        setState("supported");
        setPermission("unsupported");
        setMessage("This browser does not support push notifications.");
      }
      return;
    }

    setPermission(livePermission);

    if (livePermission === "denied") {
      if (!cancelled()) {
        setState("supported");
        setMessage(getBlockedNotificationMessage(liveOrigin, livePermission));
      }
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration("/");
      const subscription = await registration?.pushManager.getSubscription();
      const localTestEndpoint =
        typeof window !== "undefined"
          ? window.localStorage.getItem(LOCAL_TEST_FOLLOWER_KEY)
          : null;

      if (cancelled()) {
        return;
      }

      if (subscription || localTestEndpoint) {
        setState("subscribed");
        setHasLocalTestFollower(Boolean(localTestEndpoint));
        setMessage("");
      } else {
        setState("supported");
        setHasLocalTestFollower(false);
        setMessage("");
      }
    } catch {
      if (!cancelled()) {
        setState("supported");
        setHasLocalTestFollower(false);
        setMessage("");
      }
    }
  }

  useEffect(() => {
    let cancelled = false;
    const isCancelled = () => cancelled;

    queueMicrotask(() => {
      void syncSubscriptionState(isCancelled);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const isCancelled = () => cancelled;

    if (open) {
      queueMicrotask(() => {
        void syncSubscriptionState(isCancelled);
      });
    }

    function handleFocus() {
      if (open) {
        void syncSubscriptionState(isCancelled);
      }
    }

    window.addEventListener("focus", handleFocus);
    window.addEventListener("pageshow", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pageshow", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [open]);

  useEffect(() => {
    let cancelled = false;
    let status: PermissionStatus | null = null;
    const isCancelled = () => cancelled;

    async function watchNotificationPermission() {
      if (!("permissions" in navigator)) {
        return;
      }

      try {
        status = await navigator.permissions.query({
          name: "notifications" as PermissionName,
        });
        status.onchange = () => {
          void syncSubscriptionState(isCancelled);
        };
      } catch {
        status = null;
      }
    }

    void watchNotificationPermission();

    return () => {
      cancelled = true;
      if (status) {
        status.onchange = null;
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const isCancelled = () => cancelled;

    function handleFollowStateChange() {
      void syncSubscriptionState(isCancelled);
    }

    window.addEventListener(FOLLOW_STATE_CHANGE_EVENT, handleFollowStateChange);

    return () => {
      cancelled = true;
      window.removeEventListener(
        FOLLOW_STATE_CHANGE_EVENT,
        handleFollowStateChange,
      );
    };
  }, []);

  async function requestNotificationPermission() {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setState("supported");
      setPermission("unsupported");
      setMessage("This browser does not support push notifications.");
      return null;
    }

    let permission = await getLiveNotificationPermission();
    const liveOrigin = window.location.origin;

    if (permission === "unsupported") {
      setState("supported");
      setPermission("unsupported");
      setMessage("This browser does not support push notifications.");
      return null;
    }

    setPermission(permission);

    if (permission === "denied") {
      setState("supported");
      setMessage(getBlockedNotificationMessage(liveOrigin, permission));
      return null;
    }

    if (permission !== "granted") {
      permission = await Notification.requestPermission();
      setPermission(permission);
    }

    if (permission !== "granted") {
      setState("supported");
      setMessage(
        permission === "denied"
          ? getBlockedNotificationMessage(liveOrigin, permission)
          : "Notifications were not enabled.",
      );
      return null;
    }

    return permission;
  }

  function handleEnable() {
    setIsPending(true);
    setMessage("");

    void (async () => {
      try {
        const permission = await requestNotificationPermission();
        if (!permission) {
          return;
        }

        const registration = await navigator.serviceWorker.register("/sw.js");
        const existingSubscription = await registration.pushManager.getSubscription();
        const subscription =
          existingSubscription ??
          (await registration.pushManager.subscribe(getPushSubscriptionOptions()));

        const response = await fetch("/api/followers/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(subscription.toJSON()),
        });

        if (!response.ok) {
          throw new Error("Unable to save follower notification endpoint.");
        }

        setState("subscribed");
        setMessage("");
        emitFollowStateChanged();
        router.refresh();
      } catch {
        setState("supported");
        setMessage("Notification setup failed. Try again.");
      } finally {
        setIsPending(false);
      }
    })();
  }

  function handleRecheckPermission() {
    setIsPending(true);

    void (async () => {
      try {
        await syncSubscriptionState(() => false);
      } finally {
        setIsPending(false);
      }
    })();
  }

  function handleTestFollow() {
    setIsPending(true);
    setMessage("");

    void (async () => {
      try {
        const permission = await requestNotificationPermission();
        if (!permission) {
          return;
        }

        const registration = await navigator.serviceWorker.register("/sw.js");
        const endpoint = `test://local-follow-${crypto.randomUUID()}`;
        const response = await fetch("/api/followers/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint,
            keys: {
              p256dh: `test-p256dh-${crypto.randomUUID()}`,
              auth: `test-auth-${crypto.randomUUID()}`,
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Unable to create test follower.");
        }

        await registration.update();
        await showBrowserNotification(registration, {
          title: "Local test follower enabled",
          body: "This confirms browser notifications are working on this device.",
          url: "/writings",
        });
        window.localStorage.setItem(LOCAL_TEST_FOLLOWER_KEY, endpoint);
        setHasLocalTestFollower(true);
        setState("subscribed");
        setMessage("");
        emitFollowStateChanged();
        router.refresh();
      } catch {
        setMessage("Could not create a local test follower.");
      } finally {
        setIsPending(false);
      }
    })();
  }

  function handleTurnOff() {
    setIsPending(true);
    setMessage("");

    void (async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration("/");
        const subscription = await registration?.pushManager.getSubscription();
        const localTestEndpoint = window.localStorage.getItem(
          LOCAL_TEST_FOLLOWER_KEY,
        );

        if (subscription) {
          await fetch("/api/followers/unsubscribe", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          });
          await subscription.unsubscribe();
        }

        if (localTestEndpoint) {
          await fetch("/api/followers/unsubscribe", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ endpoint: localTestEndpoint }),
          });
          window.localStorage.removeItem(LOCAL_TEST_FOLLOWER_KEY);
        }

        setHasLocalTestFollower(false);
        setState("supported");
        setMessage("Notifications are turned off.");
        emitFollowStateChanged();
        router.refresh();
      } catch {
        setMessage("Could not turn notifications off here. Use browser settings if needed.");
      } finally {
        setIsPending(false);
      }
    })();
  }

  function handleSendTestNotification() {
    setIsPending(true);
    setMessage("");

    void (async () => {
      try {
        const permission = await requestNotificationPermission();
        if (!permission) {
          return;
        }

        const registration =
          (await navigator.serviceWorker.getRegistration("/")) ??
          (await navigator.serviceWorker.register("/sw.js"));

        await showBrowserNotification(registration, {
          title: "New writing just dropped",
          body: "This is a local test notification. Tap to open the writings universe.",
          url: "/writings",
        });

        setMessage("Test notification sent.");
      } catch {
        setMessage("Could not send a test notification.");
      } finally {
        setIsPending(false);
      }
    })();
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {state === "subscribed" ? "Following" : children}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07111f]/60 px-5">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="absolute right-5 top-5 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-60"
              aria-label="Close"
            >
              <FiX size={18} />
            </button>

            <div className="px-6 pb-6 pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a192f] text-white">
                {state === "subscribed" ? (
                  <FiCheckCircle size={20} />
                ) : (
                  <FiBell size={20} />
                )}
              </div>

              <p className="mt-5 text-xs font-semibold uppercase text-[#8a6a2f]">
                {state === "subscribed"
                  ? "Following D•sonofSolomon"
                  : "Follow D•sonofSolomon"}
              </p>
              {state === "subscribed" ? null : (
                <h2 className="mt-2 text-2xl font-semibold text-gray-950">
                  Follow to get notified whenever a new chapter drops.
                </h2>
              )}

              <p className="mt-3 text-sm leading-6 text-gray-600">
                {state === "subscribed"
                  ? "Notifications are on for new public chapters."
                  : "Turn it off at anytime in your browser or device settings."}
              </p>

              {message && (
                <p
                  className={`mt-4 rounded-xl px-4 py-3 text-sm leading-6 ${
                    permission === "denied"
                      ? "border border-amber-200 bg-amber-50 text-amber-900"
                      : "text-gray-600"
                  }`}
                >
                  {message}
                </p>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {state === "subscribed" ? (
                  <button
                    type="button"
                    onClick={handleTurnOff}
                    disabled={isPending}
                    className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-gray-300 px-5 text-sm font-medium text-gray-900 transition-colors hover:border-gray-900 disabled:opacity-60"
                  >
                    {isPending ? "Unfollowing..." : "Unfollow"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleEnable}
                    disabled={isPending}
                    className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-[#0a192f] px-5 text-sm font-medium text-white transition-colors hover:bg-[#13294b] disabled:bg-gray-300"
                  >
                    {isPending
                      ? permission === "denied"
                        ? "Checking..."
                        : "Turning on..."
                      : permission === "denied"
                        ? "Re-check permission"
                        : "Turn on notifications"}
                  </button>
                )}

                {permission === "denied" && (
                  <button
                    type="button"
                    onClick={handleRecheckPermission}
                    disabled={isPending}
                    className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-gray-200 px-5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
                  >
                    Refresh status
                  </button>
                )}
              </div>
            </div>

            {showLocalTesting && (
              <div className="mx-6 mb-6 rounded-xl border border-dashed border-[#0a192f]/25 bg-[#0a192f]/[0.03] p-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
                  Local testing
                </p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleTestFollow}
                    disabled={isPending}
                    className="inline-flex h-[2.6rem] cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#0a192f] px-5 text-sm font-medium text-[#0a192f] transition-colors hover:bg-[#0a192f]/5 disabled:opacity-60"
                  >
                    Create local test follower
                  </button>

                  <button
                    type="button"
                    onClick={handleSendTestNotification}
                    disabled={isPending || !hasLocalTestFollower}
                    className="inline-flex h-[2.6rem] cursor-pointer items-center justify-center rounded-xl border border-gray-300 px-5 text-sm font-medium text-gray-900 transition-colors hover:border-gray-900 disabled:opacity-50"
                  >
                    Send test notification
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
