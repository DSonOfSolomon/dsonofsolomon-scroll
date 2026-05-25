"use client";

import { useEffect, useState } from "react";
import FollowButton, {
  FOLLOW_STATE_CHANGE_EVENT,
  isLocallyFollowing,
} from "@/components/follow/FollowButton";

export default function PostFollowPrompt() {
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    function syncFollowing() {
      setFollowing(isLocallyFollowing());
    }

    syncFollowing();

    function handleFollowStateChange() {
      syncFollowing();
    }

    window.addEventListener(FOLLOW_STATE_CHANGE_EVENT, handleFollowStateChange);
    window.addEventListener("focus", handleFollowStateChange);

    return () => {
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
              New chapters will appear in your reader updates.
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
