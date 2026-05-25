"use client";

import { ReactNode, useEffect, useState } from "react";
import FollowButton, {
  FOLLOW_STATE_CHANGE_EVENT,
  isLocallyFollowing,
} from "@/components/follow/FollowButton";

type SeriesAccessGateProps = {
  children: ReactNode;
};

export default function SeriesAccessGate({ children }: SeriesAccessGateProps) {
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    function syncFollowing() {
      setFollowing(isLocallyFollowing());
    }

    syncFollowing();
    window.addEventListener(FOLLOW_STATE_CHANGE_EVENT, syncFollowing);
    window.addEventListener("storage", syncFollowing);
    window.addEventListener("focus", syncFollowing);

    return () => {
      window.removeEventListener(FOLLOW_STATE_CHANGE_EVENT, syncFollowing);
      window.removeEventListener("storage", syncFollowing);
      window.removeEventListener("focus", syncFollowing);
    };
  }, []);

  if (!following) {
    return (
      <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6a2f]">
          Series access
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-gray-950">
          Follow D•sonofSolomon to access series.
        </h2>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Following is free and unlocks the series feed.
        </p>
        <FollowButton className="mt-6 inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-[#0a192f] px-5 text-sm font-medium !text-white transition-colors hover:bg-[#13294b]">
          Follow
        </FollowButton>
      </div>
    );
  }

  return children;
}
