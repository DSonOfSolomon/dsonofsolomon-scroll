import type { Metadata } from "next";
import Container from "@/components/site/Container";
import PageWrapper from "@/components/site/PageWrapper";
import NotificationsClient from "@/components/notifications/NotificationsClient";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Reader updates from D•sonofSolomon.",
  alternates: {
    canonical: absoluteUrl("/notifications"),
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotificationsPage() {
  return (
    <PageWrapper>
      <Container className="max-w-[58rem]">
        <section className="rounded-[1.75rem] bg-[#081421] px-6 py-8 text-white md:px-9 md:py-10">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/45">
            Reader updates
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Notifications
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">
            New chapters, series episodes, and reader updates from D•sonofSolomon.
          </p>
        </section>

        <NotificationsClient />
      </Container>
    </PageWrapper>
  );
}
