import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/site/Container";
import EmptyState from "@/components/site/EmptyState";
import PageWrapper from "@/components/site/PageWrapper";
import { absoluteUrl, resolveSocialImage } from "@/lib/site";

export const metadata: Metadata = {
  title: "Series",
  description:
    "Continuing episodic worlds from D•sonofSolomon inside the Soloverse.",
  alternates: {
    canonical: absoluteUrl("/series"),
  },
  openGraph: {
    title: "Series",
    description:
      "Continuing episodic worlds from D•sonofSolomon inside the Soloverse.",
    url: absoluteUrl("/series"),
    type: "website",
    images: [
      {
        url: resolveSocialImage(),
        alt: "Series",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Series",
    description:
      "Continuing episodic worlds from D•sonofSolomon inside the Soloverse.",
    images: [resolveSocialImage()],
  },
};

export default function SeriesPage() {
  return (
    <PageWrapper>
      <Container className="max-w-[78rem]">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
              Soloverse
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
              Series
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
              Episodic writings will live here: connected pieces with a clear
              beginning, continuation, and room to follow the world as it grows.
            </p>
          </div>

          <Link
            href="/writings"
            className="inline-flex h-[2.7rem] items-center justify-center rounded-full border border-gray-300 px-5 text-sm font-medium text-gray-900 no-underline transition-colors hover:border-gray-900"
          >
            View writings
          </Link>
        </section>

        <section className="mt-12">
          <EmptyState
            title="No series yet"
            message="Series will appear here once the first episodic world is ready."
          />
        </section>
      </Container>
    </PageWrapper>
  );
}
