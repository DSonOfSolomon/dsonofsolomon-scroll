"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiX } from "react-icons/fi";

type FollowButtonProps = {
  className: string;
  children?: React.ReactNode;
};

type FollowState = "idle" | "following";

export const LOCAL_TEST_FOLLOWER_KEY = "dsonofsolomon_follower_endpoint";
export const FOLLOW_STATE_CHANGE_EVENT = "dsonofsolomon-follow-state-change";

function emitFollowStateChanged() {
  window.dispatchEvent(new Event(FOLLOW_STATE_CHANGE_EVENT));
}

function createFollowerEndpoint() {
  return `in-app://dsonofsolomon/${crypto.randomUUID()}`;
}

function createFollowerKeys(endpoint: string) {
  return {
    p256dh: `in-app-p256dh-${endpoint}`,
    auth: `in-app-auth-${endpoint}`,
  };
}

function getStoredFollowerEndpoint() {
  return window.localStorage.getItem(LOCAL_TEST_FOLLOWER_KEY);
}

export function isLocallyFollowing() {
  if (!("localStorage" in window)) {
    return false;
  }

  return Boolean(getStoredFollowerEndpoint());
}

export default function FollowButton({
  className,
  children = "Follow",
}: FollowButtonProps) {
  const router = useRouter();
  const [state, setState] = useState<FollowState>("idle");
  const [isPending, setIsPending] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function syncFollowing() {
      setState(isLocallyFollowing() ? "following" : "idle");
    }

    syncFollowing();
    window.addEventListener(FOLLOW_STATE_CHANGE_EVENT, syncFollowing);
    window.addEventListener("storage", syncFollowing);

    return () => {
      window.removeEventListener(FOLLOW_STATE_CHANGE_EVENT, syncFollowing);
      window.removeEventListener("storage", syncFollowing);
    };
  }, []);

  function handleFollow() {
    if (isPending) {
      return;
    }

    setIsPending(true);

    void (async () => {
      try {
        const endpoint = getStoredFollowerEndpoint() ?? createFollowerEndpoint();
        const response = await fetch("/api/followers/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint,
            keys: createFollowerKeys(endpoint),
          }),
        });

        if (!response.ok) {
          throw new Error("Unable to save follower.");
        }

        window.localStorage.setItem(LOCAL_TEST_FOLLOWER_KEY, endpoint);
        setState("following");
        emitFollowStateChanged();
        router.refresh();
      } finally {
        setIsPending(false);
      }
    })();
  }

  function handleUnfollow() {
    if (isPending) {
      return;
    }

    const endpoint = getStoredFollowerEndpoint();

    if (!endpoint) {
      setState("idle");
      return;
    }

    setIsPending(true);

    void (async () => {
      try {
        await fetch("/api/followers/unsubscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ endpoint }),
        });

        window.localStorage.removeItem(LOCAL_TEST_FOLLOWER_KEY);
        setState("idle");
        setOpen(false);
        emitFollowStateChanged();
        router.refresh();
      } finally {
        setIsPending(false);
      }
    })();
  }

  function handleButtonClick() {
    if (state === "following") {
      setOpen(true);
      return;
    }

    handleFollow();
  }

  const label = isPending
    ? state === "following"
      ? "Unfollowing..."
      : "Following..."
    : state === "following"
      ? "Following"
      : children;

  return (
    <>
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isPending}
        className={className}
        aria-pressed={state === "following"}
      >
        {label}
      </button>

      {open && state === "following" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07111f]/60 px-5">
          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="absolute right-4 top-4 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-60"
              aria-label="Close"
            >
              <FiX size={18} />
            </button>

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6a2f]">
              Following D•sonofSolomon
            </p>
            <p className="mt-4 max-w-[18rem] text-base font-medium leading-7 text-gray-950">
              You now have access to series.
            </p>

            <p className="mt-2 max-w-[18rem] text-base font-medium leading-7 text-gray-700">
              You get in-app notifications whenever a new series or chapter drops.
            </p>

            <button
              type="button"
              onClick={handleUnfollow}
              disabled={isPending}
              className="mt-6 inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-gray-300 px-5 text-sm font-medium text-gray-900 transition-colors hover:border-gray-900 disabled:opacity-60"
            >
              {isPending ? "Unfollowing..." : "Unfollow"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
