import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/site/Container";
import EmptyState from "@/components/site/EmptyState";
import PageWrapper from "@/components/site/PageWrapper";
import SeriesAccessGate from "@/components/series/SeriesAccessGate";
import SeriesPreviewCard from "@/components/series/SeriesPreviewCard";
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

const PAGE_SIZE = 6;

const publishedSeriesWhere = {
  posts: {
    some: {
      status: "published",
      universe: "series",
    },
  },
};

function normalizePage(page: string | undefined) {
  const value = Number(page);

  if (!Number.isFinite(value) || value < 1) {
    return 1;
  }

  return Math.floor(value);
}

export default async function SeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const requestedPage = normalizePage(page);
  const totalCount = await prisma.series.count({
    where: publishedSeriesWhere,
  });
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const seriesList = await prisma.series.findMany({
    where: publishedSeriesWhere,
    include: {
      posts: {
        where: {
          status: "published",
          universe: "series",
        },
        select: {
          title: true,
          excerpt: true,
          content: true,
          episodeNumber: true,
          category: {
            select: {
              name: true,
            },
          },
        },
        orderBy: [
          {
            episodeNumber: "asc",
          },
          {
            publishedAt: "asc",
          },
        ],
        take: 1,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <PageWrapper>
      <Container className="max-w-[78rem]">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex text-sm font-medium text-[#0a192f] transition-colors hover:text-[#13294b]"
          >
            ← Back home
          </Link>
        </div>

        <section className="overflow-hidden rounded-[1.50 rem] bg-[#081421] text-white">
          <div className="px-6 py-8 md:px-9 md:py-10 lg:px-11">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/45">
                Souloverse
              </p>

              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
                Series
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">
                Immerse yourself in this episodic souloverse.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12 pb-20 md:pb-24">
          <SeriesAccessGate>
            {seriesList.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {seriesList.map((series) => {
                  const firstEpisode = series.posts[0];
                  if (!firstEpisode) {
                    return null;
                  }

                  return (
                    <SeriesPreviewCard
                      key={series.id}
                      href={`/series/${series.slug}`}
                      seriesTitle={series.title}
                      episodeTitle={firstEpisode.title}
                      excerpt={getPostPreview(firstEpisode.excerpt, firstEpisode.content)}
                      category={firstEpisode.category?.name ?? "Series"}
                      episodeLabel={
                        firstEpisode.episodeNumber
                          ? `Episode ${firstEpisode.episodeNumber}`
                          : "Episode"
                      }
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No series yet"
                message="Series will appear here once the first episodic world is ready."
              />
            )}

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-between gap-4 border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </p>

                <div className="flex gap-3">
                  {hasPreviousPage ? (
                    <Link
                      href={currentPage - 1 === 1 ? "/series" : `/series?page=${currentPage - 1}`}
                      className="inline-flex rounded-full border border-gray-300 bg-transparent px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:border-gray-900"
                    >
                      Previous
                    </Link>
                  ) : (
                    <span className="inline-flex rounded-full border border-gray-200 bg-transparent px-4 py-2 text-sm font-medium text-gray-400">
                      Previous
                    </span>
                  )}

                  {hasNextPage ? (
                    <Link
                      href={`/series?page=${currentPage + 1}`}
                      className="inline-flex rounded-full border border-gray-300 bg-transparent px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:border-gray-900"
                    >
                      Next
                    </Link>
                  ) : (
                    <span className="inline-flex rounded-full border border-gray-200 bg-transparent px-4 py-2 text-sm font-medium text-gray-400">
                      Next
                    </span>
                  )}
                </div>
              </div>
            )}
          </SeriesAccessGate>
        </section>
      </Container>
    </PageWrapper>
  );
}
