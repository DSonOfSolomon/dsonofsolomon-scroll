type AnalyticsEvent = {
  type: "page_view" | "post_view" | "reading_progress";
  path: string;
  referrer?: string;
  sessionId?: string;
  postId?: string;
  universe?: string;
  progress?: number;
  secondsSpent?: number;
  completed?: boolean;
};

const SESSION_KEY = "dsonofsolomon_analytics_session";

export function getAnalyticsSessionId() {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) {
    return existing;
  }

  const next =
    typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(SESSION_KEY, next);
  return next;
}

export function sendAnalyticsEvent(event: AnalyticsEvent) {
  const body = JSON.stringify({
    ...event,
    sessionId: event.sessionId ?? getAnalyticsSessionId(),
  });

  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon("/api/analytics", blob)) {
      return;
    }
  }

  void fetch("/api/analytics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    keepalive: true,
  });
}
