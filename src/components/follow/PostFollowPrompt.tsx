"use client";

import { useEffect, useState } from "react";
import FollowButton, {
  FOLLOW_STATE_CHANGE_EVENT,
  LOCAL_TEST_FOLLOWER_KEY,
} from "@/components/follow/FollowButton";

async function isFollowing() {
  if (!("serviceWorker" in navigator)) {
    return false;
  }

  const registration = await navigator.serviceWorker.getRegistration("/");
  const subscription = await registration?.pushManager.getSubscription();
  const localTestEndpoint = window.localStorage.getItem(
    LOCAL_TEST_FOLLOWER_KEY,
  );

  return Boolean(subscription || localTestEndpoint);
}

export default function PostFollowPrompt() {
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function syncFollowing() {
      const nextFollowing = await isFollowing();

      if (!cancelled) {
        setFollowing(nextFollowing);
      }
    }

    void syncFollowing();

    function handleFollowStateChange() {
      void syncFollowing();
    }

    window.addEventListener(FOLLOW_STATE_CHANGE_EVENT, handleFollowStateChange);
    window.addEventListener("focus", handleFollowStateChange);

    return () => {
      cancelled = true;
      window.removeEventListener(
        FOLLOW_STATE_CHANGE_EVENT,
        handleFollowStateChange,
      );
      window.removeEventListener("focus", handleFollowStateChange);
    };
  }, []);

  return (
    <section className="mt-16 border-t border-gray-200 pt-10">
      <div className="max-w-[24rem] rounded-[1.2rem] border border-gray-200 bg-[#f7f5ef] px-4 py-3.5">
        <p className="text-base leading-7 text-gray-700">
          {following ? (
            <>
              Thank you for reading this piece.
              <br />
              You will be notified when a new chapter drops.
            </>
          ) : (
            <>
              If this resonated with you, hit the follow
              <br />
              button to stay updated on future writings.
            </>
          )}
        </p>
        <FollowButton
          className="mt-3 inline-flex rounded-full bg-[#0a192f] px-3.5 py-2 text-sm font-medium !text-white no-underline transition-colors hover:bg-[#13294b]"
        >
          Follow
        </FollowButton>
      </div>
    </section>
  );
}
