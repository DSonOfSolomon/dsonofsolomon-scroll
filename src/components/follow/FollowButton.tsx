"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  const [isIntentionalUnfollow, setIsIntentionalUnfollow] = useState(false);

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
        setIsIntentionalUnfollow(false);
        emitFollowStateChanged();
        router.refresh();
      } finally {
        setIsPending(false);
      }
    })();
  }

  const label = isPending
    ? state === "following"
      ? "Unfollowing..."
      : "Following..."
    : state === "following"
      ? isIntentionalUnfollow
        ? "Unfollow"
        : "Following"
      : children;

  return (
    <button
      type="button"
      onClick={state === "following" ? handleUnfollow : handleFollow}
      onBlur={() => setIsIntentionalUnfollow(false)}
      onFocus={() => setIsIntentionalUnfollow(state === "following")}
      onMouseEnter={() => setIsIntentionalUnfollow(state === "following")}
      onMouseLeave={() => setIsIntentionalUnfollow(false)}
      disabled={isPending}
      className={className}
      aria-pressed={state === "following"}
    >
      {label}
    </button>
  );
}
