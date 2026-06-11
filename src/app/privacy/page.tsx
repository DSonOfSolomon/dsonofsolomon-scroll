import type { Metadata } from "next";
import Container from "@/components/site/Container";
import PageWrapper from "@/components/site/PageWrapper";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How D•sonofSolomon handles essential cookies, browser storage, analytics, follow state, and reader notifications.",
};

const sections = [
  {
    title: "Information currently collected",
    body: [
      "This site collects limited information needed to operate, secure, and improve the reader experience.",
      "This may include page views, post views, reading progress, read completion, time spent reading, referrer information, browser or device information, timestamps, reader follow state, and notification read/unread state.",
    ],
  },
  {
    title: "How information is used",
    body: [
      "Information is used to understand how writings are being read, improve the site, show reader updates, manage notification state, protect the admin area, and prevent abuse or excessive requests.",
      "Personal data is not sold.",
    ],
  },
  {
    title: "Cookies and browser storage",
    body: [
      "The site currently uses an essential admin session cookie to protect private site-management areas. This cookie is used for security and authentication.",
      "The site may use browser local storage to remember follow status, notification state, last-seen notification information, and a basic first-party analytics session identifier.",
      "The site does not currently use advertising cookies, behavioural marketing cookies, or third-party tracking pixels.",
    ],
  },
  {
    title: "Analytics",
    body: [
      "The site uses first-party analytics to understand content performance and reader engagement.",
      "Analytics are used for site improvement and content insight, not for advertising profiling.",
    ],
  },
  {
    title: "Followers and notifications",
    body: [
      "If you choose to follow updates, the site may store information needed to remember your follow state and show reader notifications.",
      "This may include a browser-generated endpoint or local follow identifier, follow status, notification records, and read/unread notification state.",
    ],
  },
  {
    title: "Third-party services",
    body: [
      "The site uses trusted infrastructure providers to operate: Vercel for hosting, Neon for PostgreSQL database hosting, Vercel Blob for uploaded media storage, and Upstash Redis for rate limiting and abuse prevention.",
      "These providers process information only as needed to provide infrastructure and hosting services.",
    ],
  },
  {
    title: "Your choices",
    body: [
      "You can choose not to follow updates, clear cookies and local storage in your browser, disable browser notifications, or contact the site owner about information connected to you.",
      "Clearing cookies or local storage may cause some site features, such as follow state or notifications, to reset.",
    ],
  },
  {
    title: "Security",
    body: [
      "Reasonable technical measures are used to protect the site, including secure admin authentication, HTTP-only admin cookies, server-side database access, rate limiting, managed infrastructure, and environment-based secret management.",
      "No website can guarantee absolute security, but the site is designed to reduce unnecessary data exposure.",
    ],
  },
  {
    title: "Changes to this policy",
    body: [
      "This policy may be updated if the site changes, especially if new features such as email subscriptions, payments, advertising, or third-party analytics are added.",
      "The last updated date will show when this policy was most recently changed.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageWrapper>
        <Container className="max-w-3xl pb-16 md:pb-20">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-gray-500">
            Privacy
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
            Privacy Policy
          </h1>

          <p className="mt-4 text-sm text-gray-500">
            Last updated: 11 June 2026
          </p>

          <div className="mt-8 space-y-5 text-base leading-8 text-gray-700">
            <p>
              This Privacy Policy explains how D•sonofSolomon collects, uses,
              stores, and protects information when you use this website.
            </p>
            <p>
              This policy describes the features currently active on the site.
              If new features are added later, this policy will be updated.
            </p>
          </div>

          <div className="mt-12 space-y-10">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-2xl font-semibold tracking-tight text-gray-950">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-base leading-8 text-gray-700">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className="mt-12 border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-950">
              Contact
            </h2>
            <p className="mt-4 text-base leading-8 text-gray-700">
              For privacy questions or requests, contact the site owner through
              the current public contact channel for D•sonofSolomon.
            </p>
          </section>
        </Container>
      </PageWrapper>
      <SiteFooter />
    </>
  );
}
