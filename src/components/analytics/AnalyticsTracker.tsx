"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { sendAnalyticsEvent } from "@/components/analytics/analytics-client";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) {
      return;
    }

    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;

    sendAnalyticsEvent({
      type: "page_view",
      path,
      referrer: document.referrer || undefined,
    });
  }, [pathname, searchParams]);

  return null;
}
