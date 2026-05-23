"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { sendAnalyticsEvent } from "@/components/analytics/analytics-client";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) {
      return;
    }

    const path = query ? `${pathname}?${query}` : pathname;

    sendAnalyticsEvent({
      type: "page_view",
      path,
      referrer: document.referrer || undefined,
    });
  }, [pathname, query]);

  return null;
}
