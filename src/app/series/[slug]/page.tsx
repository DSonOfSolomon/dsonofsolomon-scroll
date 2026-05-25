import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/site/Container";
import PageWrapper from "@/components/site/PageWrapper";
import SeriesAccessGate from "@/components/series/SeriesAccessGate";
import CategoryBadge from "@/components/writings/CategoryBadge";
import { prisma } from "@/lib/prisma";
import { absoluteUrl, resolveSocialImage } from "@/lib/site";
import { getPostPreview } from "@/lib/writings";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

async function getPublishedSeries(slug: string) {
  return prisma.series.findFirst({
    where: {
      slug,
      posts: {
        some: {
          status: "published",
          universe: "series",
        },
      },
    },
    include: {
      posts: {
        where: {
          status: "published",
          universe: "series",
        },
        include: {
          category: true,
        },
        orderBy: [
          {
            episodeNumber: "asc",
          },
          {
            publishedAt: "asc",
          },
        ],
      },
    },
  });
}

function formatDate(value: Date) {
  return value.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const series = await getPublishedSeries(slug);

  if (!series) {
    return {
      title: "Series",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const firstEpisode = series.posts[0];
  const description =
    series.description?.trim() ||
    (firstEpisode ? getPostPreview(firstEpisode.excerpt, firstEpisode.content) : "");
  const url = absoluteUrl(`/series/${series.slug}`);

  return {
    title: series.title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: series.title,
      description,
      url,
      type: "website",
      images: [
        {
          url: resolveSocialImage(firstEpisode?.coverImage),
          alt: series.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: series.title,
      description,
      images: [resolveSocialImage(firstEpisode?.coverImage)],
    },
  };
}

export default async function SeriesLandingPage({ params }: Props) {
  const { slug } = await params;
  const series = await getPublishedSeries(slug);

  if (!series) {
    notFound();
  }

  const firstEpisode = series.posts[0];
  const category = firstEpisode?.category?.name ?? "Series";
  const description =
    series.description?.trim() ||
    (firstEpisode ? getPostPreview(firstEpisode.excerpt, firstEpisode.content) : "");

  return (
    <PageWrapper>
      <Container className="max-w-[78rem]">
        <div className="mb-6">
          <Link
            href="/series"
            className="inline-flex text-sm font-medium text-[#0a192f] transition-colors hover:text-[#13294b]"
          >
            ← Back to series
          </Link>
        </div>

        <section className="border-b border-gray-200 pb-10">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
              Series
            </p>

            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
              {series.title}
            </h1>

            {description ? (
              <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
                {description}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span>{category}</span>
              <span>•</span>
              <span>
                {series.posts.length === 1
                  ? "1 episode"
                  : `${series.posts.length} episodes`}
              </span>
            </div>
          </div>
        </section>

        <section className="mt-12 pb-20 md:pb-24">
          <SeriesAccessGate>
            <div className="mb-8">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
                Episodes
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-950">
                Read the series
              </h2>
            </div>

            <div className="rounded-[1.25rem] border border-gray-200 bg-white px-5 py-2 shadow-sm md:px-7">
              {series.posts.map((episode) => (
                <article
                  key={episode.id}
                  className="border-t border-gray-200 py-7 first:border-t-0"
                >
                  <Link
                    href={`/series/${series.slug}/${episode.slug}`}
                    className="group grid gap-4 no-underline md:grid-cols-[12rem_minmax(0,1fr)] md:gap-8"
                  >
                    <div className="space-y-3 text-sm text-gray-500">
                      <CategoryBadge label={episode.category?.name ?? category} />
                      <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
                        {episode.episodeNumber
                          ? `Episode ${episode.episodeNumber}`
                          : "Episode"}
                      </p>
                      <p>{formatDate(episode.publishedAt ?? episode.createdAt)}</p>
                    </div>

                    <div>
                      <h3 className="text-2xl font-semibold tracking-tight text-[#8a6a2f] transition-colors group-hover:text-[#6f5525]">
                        {episode.title}
                      </h3>
                      <p className="mt-4 max-w-[44rem] text-base leading-8 text-gray-600">
                        {getPostPreview(episode.excerpt, episode.content)}
                        <span className="text-gray-400">...</span>
                        <span className="font-semibold text-[#0a192f]">immerse</span>
                      </p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </SeriesAccessGate>
        </section>
      </Container>
    </PageWrapper>
  );
}
