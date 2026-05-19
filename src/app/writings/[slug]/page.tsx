import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/site/Container";
import FollowButton from "@/components/follow/FollowButton";
import PageWrapper from "@/components/site/PageWrapper";
import WritingCard from "@/components/writings/WritingCard";
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

async function getPublicPostBySlug(slug: string) {
  return prisma.post.findFirst({
    where: {
      slug,
      status: "published",
      universe: "public",
    },
    include: {
      category: true,
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicPostBySlug(slug);

  if (!post) {
    return {
      title: "Writings",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description = getPostPreview(post.excerpt, post.content);
  const title = post.title;
  const url = absoluteUrl(`/writings/${post.slug}`);

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

export default async function WritingPage({ params }: Props) {
  const { slug } = await params;

  const post = await getPublicPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const formattedDate = (post.publishedAt ?? post.createdAt).toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
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
  const primaryContinuation =
    (await prisma.post.findFirst({
      where: {
        status: "published",
        universe: "public",
        slug: {
          not: post.slug,
        },
        ...(post.categoryId ? { categoryId: post.categoryId } : {}),
      },
      include: {
        category: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
    })) ??
    (await prisma.post.findFirst({
      where: {
        status: "published",
        universe: "public",
        slug: {
          not: post.slug,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
    }));

  const continuationWritings = await prisma.post.findMany({
    where: {
      status: "published",
      universe: "public",
      slug: {
        notIn: [post.slug, primaryContinuation?.slug ?? ""],
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: 2,
  });

  return (
    <PageWrapper>
      <Container className="max-w-[44rem]">
        <article>
          <div className="mb-8">
            <Link
              href="/writings"
              className="inline-flex text-sm font-medium text-[#0a192f] transition-colors hover:text-[#13294b]"
            >
              ← Back
            </Link>
          </div>

          {post.coverImage ? (
            <div className="space-y-8 border-b border-gray-200 pb-10">
              <div>
                <CategoryBadge label={post.category?.name ?? "Writing"} />

                {post.chapterLabel && (
                  <p className="mt-4 text-xs uppercase tracking-[0.22em] text-gray-500">
                    {post.chapterLabel}
                  </p>
                )}

                <h1 className="mt-4 max-w-[40rem] text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
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

              <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-[#f7f5ef]">
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
            </div>
          ) : (
            <div className="border-b border-gray-200 pb-10">
              <CategoryBadge label={post.category?.name ?? "Writing"} />

              {post.chapterLabel && (
                <p className="mt-4 text-xs uppercase tracking-[0.22em] text-gray-500">
                  {post.chapterLabel}
                </p>
              )}

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
          )}

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

        {siteFeatures.followEnabled && (
          <section className="mt-16 border-t border-gray-200 pt-10">
            <div className="max-w-[22rem] rounded-[1.2rem] border border-gray-200 bg-[#f7f5ef] px-4 py-3.5">
              <p className="text-base leading-7 text-gray-700">
                If this resonated with you, hit the follow 
                <br />
                button to stay updated on future writings.
              </p>
              <FollowButton
                className="mt-3 inline-flex rounded-full bg-[#0a192f] px-3.5 py-2 text-sm font-medium !text-white no-underline transition-colors hover:bg-[#13294b]"
              >
                Follow
              </FollowButton>
            </div>
          </section>
        )}

        {(primaryContinuation || continuationWritings.length > 0) && (
          <section className="mt-16 border-t border-gray-200 pt-10">
            <div className="mb-8">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
                Continue the universe
              </p>

              <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-950">
                Where to go next
              </h2>
            </div>

            {primaryContinuation && (
              <Link
                href={`/writings/${primaryContinuation.slug}`}
                className="block rounded-[1.8rem] border border-gray-200 bg-[#f7f5ef] p-6 no-underline transition-colors hover:border-gray-400 md:p-7"
              >
                <article className="max-w-[36rem]">
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-gray-500">
                    Next recommended reading
                  </p>

                  <div className="mt-4">
                    <CategoryBadge
                      label={primaryContinuation.category?.name ?? "Writing"}
                    />
                  </div>

                  {primaryContinuation.chapterLabel && (
                    <p className="mt-4 text-xs uppercase tracking-[0.22em] text-gray-500">
                      {primaryContinuation.chapterLabel}
                    </p>
                  )}

                  <h3 className="mt-4 text-2xl font-semibold tracking-tight text-gray-950 md:text-[2rem]">
                    {primaryContinuation.title}
                  </h3>

                  <p className="mt-4 max-w-[34rem] text-base leading-8 text-gray-600">
                    {getPostPreview(
                      primaryContinuation.excerpt,
                      primaryContinuation.content,
                    )}
                    <span className="text-gray-400">...</span>
                  </p>

                  <p className="mt-6 inline-flex text-sm font-medium text-[#0a192f] transition-colors hover:text-[#13294b]">
                    Read next
                  </p>
                </article>
              </Link>
            )}

            {continuationWritings.length > 0 && (
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {continuationWritings.map((writing) => (
                  <WritingCard
                    key={writing.slug}
                    title={writing.title}
                    excerpt={getPostPreview(writing.excerpt, writing.content)}
                    slug={writing.slug}
                    category={writing.category?.name ?? "Writing"}
                    chapterLabel={writing.chapterLabel ?? undefined}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </Container>
    </PageWrapper>
  );
}
