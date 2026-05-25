import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostReadingTracker from "@/components/analytics/PostReadingTracker";
import PostFollowPrompt from "@/components/follow/PostFollowPrompt";
import Container from "@/components/site/Container";
import PageWrapper from "@/components/site/PageWrapper";
import CategoryBadge from "@/components/writings/CategoryBadge";
import { siteFeatures } from "@/lib/features";
import { prisma } from "@/lib/prisma";
import { absoluteUrl, resolveSocialImage } from "@/lib/site";
import { getPostPreview } from "@/lib/writings";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

async function getSeriesEpisodeBySlug(slug: string) {
  return prisma.post.findFirst({
    where: {
      slug,
      status: "published",
      universe: "series",
    },
    include: {
      category: true,
      series: true,
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getSeriesEpisodeBySlug(slug);

  if (!post) {
    return {
      title: "Series",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = post.series?.title
    ? `${post.series.title}: ${post.title}`
    : post.title;
  const description = getPostPreview(post.excerpt, post.content);
  const url = absoluteUrl(`/series/${post.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: (post.publishedAt ?? post.createdAt).toISOString(),
      images: [
        {
          url: resolveSocialImage(post.coverImage),
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [resolveSocialImage(post.coverImage)],
    },
  };
}

export default async function SeriesEpisodePage({ params }: Props) {
  const { slug } = await params;
  const post = await getSeriesEpisodeBySlug(slug);

  if (!post) {
    notFound();
  }

  const formattedDate = (post.publishedAt ?? post.createdAt).toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );
  const wordCount = post.content.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const coverImageIsSvg = post.coverImage?.toLowerCase().endsWith(".svg");
  const paragraphs = post.content
    .replace(/\r\n/g, "\n")
    .trim()
    .split(/\n\s*\n+/)
    .map((paragraph) => paragraph.replace(/\n+/g, " ").trim())
    .filter(Boolean);

  return (
    <PageWrapper>
      <Container className="max-w-[44rem]">
        <article>
          <PostReadingTracker postId={post.id} universe={post.universe} />
          <div className="mb-8">
            <Link
              href="/series"
              className="inline-flex text-sm font-medium text-[#0a192f] transition-colors hover:text-[#13294b]"
            >
              Back to series
            </Link>
          </div>

          <div className="border-b border-gray-200 pb-10">
            <CategoryBadge label={post.category?.name ?? "Series"} />

            <p className="mt-4 text-xs uppercase tracking-[0.22em] text-gray-500">
              {post.episodeNumber ? `Episode ${post.episodeNumber}` : "Series"}
            </p>

            {post.series ? (
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-[#8a6a2f]">
                {post.series.title}
              </p>
            ) : null}

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
              {post.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span>D•sonofSolomon</span>
              <span>•</span>
              <span>{formattedDate}</span>
              <span>•</span>
              <span>{readingTime} min read</span>
            </div>
          </div>

          {post.coverImage ? (
            <div className="mt-8 overflow-hidden rounded-[2rem] border border-gray-200 bg-[#f7f5ef]">
              <Image
                src={post.coverImage}
                alt={post.title}
                width={1600}
                height={1000}
                className="h-auto w-full object-cover"
                sizes="(max-width: 768px) 100vw, 44rem"
                priority
                unoptimized={coverImageIsSvg}
              />
            </div>
          ) : null}

          <div className="mt-10">
            <div className="max-w-[43rem] space-y-7 text-[1.075rem] leading-[2.05rem] tracking-[-0.005em] text-gray-700 md:text-[1.18rem] md:leading-[2.22rem]">
              {paragraphs.map((paragraph, index) => (
                <p key={`${index}-${paragraph.slice(0, 24)}`}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </article>

        {siteFeatures.followEnabled && <PostFollowPrompt />}
      </Container>
    </PageWrapper>
  );
}
