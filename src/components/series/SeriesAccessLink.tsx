"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MouseEvent, ReactNode, useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import FollowButton, {
  FOLLOW_STATE_CHANGE_EVENT,
  isLocallyFollowing,
} from "@/components/follow/FollowButton";

type SeriesAccessLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  onNavigate?: () => void;
  role?: string;
};

export default function SeriesAccessLink({
  href,
  children,
  className,
  onNavigate,
  role,
}: SeriesAccessLinkProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(false);
  const [open, setOpen] = useState(false);

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

  useEffect(() => {
    if (open && following) {
      const timeout = window.setTimeout(() => {
        setOpen(false);
        onNavigate?.();
        router.push(href);
      }, 0);

      return () => window.clearTimeout(timeout);
    }
  }, [following, href, onNavigate, open, router]);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (following) {
      onNavigate?.();
      return;
    }

    event.preventDefault();
    setOpen(true);
  }

  return (
    <>
      <Link href={href} className={className} onClick={handleClick} role={role}>
        {children}
      </Link>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07111f]/60 px-5">
          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              aria-label="Close"
            >
              <FiX size={18} />
            </button>

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6a2f]">
              Series access
            </p>
            <p className="mt-4 max-w-[18rem] text-base font-medium leading-7 text-gray-950">
              Follow D•sonofSolomon to access series.
            </p>

            <FollowButton className="mt-6 inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-[#0a192f] px-5 text-sm font-medium !text-white transition-colors hover:bg-[#13294b]">
              Follow
            </FollowButton>
          </div>
        </div>
      ) : null}
    </>
  );
}
