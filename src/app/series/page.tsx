import type { Metadata } from "next";
import Container from "@/components/site/Container";
import EmptyState from "@/components/site/EmptyState";
import PageWrapper from "@/components/site/PageWrapper";
import WritingCard from "@/components/writings/WritingCard";
import { prisma } from "@/lib/prisma";
import { absoluteUrl, resolveSocialImage } from "@/lib/site";
import { getPostPreview } from "@/lib/writings";

export const metadata: Metadata = {
  title: "Series",
  description:
    "Continuing episodic worlds from D•sonofSolomon inside the Souloverse.",
  alternates: {
    canonical: absoluteUrl("/series"),
  },
  openGraph: {
    title: "Series",
    description:
      "Continuing episodic worlds from D•sonofSolomon inside the Souloverse.",
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
      "Continuing episodic worlds from D•sonofSolomon inside the Souloverse.",
    images: [resolveSocialImage()],
  },
};

export default async function SeriesPage() {
  const episodes = await prisma.post.findMany({
    where: {
      status: "published",
      universe: "series",
      seriesId: {
        not: null,
      },
    },
    include: {
      category: true,
      series: true,
    },
    orderBy: [
      {
        publishedAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  return (
    <PageWrapper>
      <Container className="max-w-[78rem]">
        <section className="overflow-hidden rounded-[1.75rem] bg-[#081421] text-white">
          <div className="px-6 py-8 md:px-9 md:py-10 lg:px-11">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/45">
                Souloverse
              </p>

              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
                Series
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">
                Episodic writings will live here: connected pieces with a clear
                beginning, continuation, and room to follow the world as it grows.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12 pb-16">
          {episodes.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {episodes.map((episode) => (
                <WritingCard
                  key={episode.slug}
                  title={episode.series?.title ?? episode.title}
                  excerpt={getPostPreview(episode.excerpt, episode.content)}
                  slug={episode.slug}
                  category={episode.category?.name ?? "Series"}
                  chapterLabel={
                    episode.episodeNumber
                      ? `Episode ${episode.episodeNumber}`
                      : undefined
                  }
                  basePath="/series"
                  actionLabel="Enter episode"
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No series yet"
              message="Series will appear here once the first episodic world is ready."
            />
          )}
        </section>
      </Container>
    </PageWrapper>
  );
}
