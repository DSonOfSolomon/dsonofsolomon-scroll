"use client";

import { useEffect } from "react";
import { READING_MILESTONES } from "@/lib/analytics";

function getOrCreateStorageId(key: string, storage: Storage) {
  const existing = storage.getItem(key);

  if (existing) {
    return existing;
  }

  const nextValue = crypto.randomUUID();
  storage.setItem(key, nextValue);
  return nextValue;
}

function sendReadingEvent(payload: {
  postId: string;
  milestone: number;
  visitorId: string;
  sessionId: string;
}) {
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/reading", blob);
    return;
  }

  void fetch("/api/analytics/reading", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    keepalive: true,
  });
}

export default function ReadingTracker({ postId }: { postId: string }) {
  useEffect(() => {
    const article = document.querySelector("[data-reading-article]");

    if (!article) {
      return;
    }

    const visitorId = getOrCreateStorageId("analytics_visitor_id", localStorage);
    const sessionId = getOrCreateStorageId("analytics_session_id", sessionStorage);
    const sentKey = `reading_milestones:${postId}:${sessionId}`;
    const sentMilestones = new Set<number>(
      JSON.parse(sessionStorage.getItem(sentKey) ?? "[]") as number[],
    );

    const persistMilestones = () => {
      sessionStorage.setItem(sentKey, JSON.stringify(Array.from(sentMilestones)));
    };

    const trackProgress = () => {
      const rect = article.getBoundingClientRect();
      const scrollTop = window.scrollY + rect.top;
      const articleHeight = article.scrollHeight;
      const viewportBottom = window.scrollY + window.innerHeight;
      const maxScrollable = Math.max(articleHeight - window.innerHeight, 1);
      const progress = Math.min(
        100,
        Math.max(0, ((viewportBottom - scrollTop) / maxScrollable) * 100),
      );

      for (const milestone of READING_MILESTONES) {
        if (progress >= milestone && !sentMilestones.has(milestone)) {
          sentMilestones.add(milestone);
          persistMilestones();
          sendReadingEvent({
            postId,
            milestone,
            visitorId,
            sessionId,
          });
        }
      }
    };

    trackProgress();
    window.addEventListener("scroll", trackProgress, { passive: true });
    window.addEventListener("resize", trackProgress);

    return () => {
      window.removeEventListener("scroll", trackProgress);
      window.removeEventListener("resize", trackProgress);
    };
  }, [postId]);

  return null;
}
