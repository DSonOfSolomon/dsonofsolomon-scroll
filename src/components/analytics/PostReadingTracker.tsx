"use client";

import { useEffect } from "react";
import {
  getAnalyticsSessionId,
  sendAnalyticsEvent,
} from "@/components/analytics/analytics-client";

type PostReadingTrackerProps = {
  postId: string;
  universe: string;
};

function getReadingProgress() {
  const scrollTop = window.scrollY;
  const viewportHeight = window.innerHeight;
  const pageHeight = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight,
  );
  const readableHeight = Math.max(1, pageHeight - viewportHeight);

  return Math.min(100, Math.round((scrollTop / readableHeight) * 100));
}

export default function PostReadingTracker({
  postId,
  universe,
}: PostReadingTrackerProps) {
  useEffect(() => {
    const sessionId = getAnalyticsSessionId();
    const path = `${window.location.pathname}${window.location.search}`;
    const startedAt = Date.now();
    let maxProgress = getReadingProgress();
    let lastSentProgress = 0;

    sendAnalyticsEvent({
      type: "post_view",
      path,
      postId,
      universe,
      referrer: document.referrer || undefined,
      sessionId,
    });

    const sendReadingProgress = () => {
      maxProgress = Math.max(maxProgress, getReadingProgress());
      const secondsSpent = Math.max(1, Math.round((Date.now() - startedAt) / 1000));

      if (maxProgress < lastSentProgress + 5 && maxProgress < 90) {
        return;
      }

      lastSentProgress = maxProgress;

      sendAnalyticsEvent({
        type: "reading_progress",
        path,
        postId,
        universe,
        progress: maxProgress,
        secondsSpent,
        completed: maxProgress >= 90,
        sessionId,
      });
    };

    const handleScroll = () => {
      maxProgress = Math.max(maxProgress, getReadingProgress());
    };

    const handlePageHide = () => {
      maxProgress = Math.max(maxProgress, getReadingProgress());
      const secondsSpent = Math.max(1, Math.round((Date.now() - startedAt) / 1000));

      sendAnalyticsEvent({
        type: "reading_progress",
        path,
        postId,
        universe,
        progress: maxProgress,
        secondsSpent,
        completed: maxProgress >= 90,
        sessionId,
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pagehide", handlePageHide);

    const interval = window.setInterval(sendReadingProgress, 15000);
    const firstProgressTimeout = window.setTimeout(sendReadingProgress, 4000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(firstProgressTimeout);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pagehide", handlePageHide);
      handlePageHide();
    };
  }, [postId, universe]);

  return null;
}
