import type { Metadata } from "next";
import Image from "next/image";
import Container from "@/components/site/Container";
import FollowButton from "@/components/follow/FollowButton";
import SiteFooter from "@/components/site/SiteFooter";
import PageWrapper from "@/components/site/PageWrapper";
import WritingCard from "@/components/writings/WritingCard";
import Link from "next/link";
import { getPrimaryCreator } from "@/lib/admin";
import { siteFeatures } from "@/lib/features";
import { prisma } from "@/lib/prisma";
import { absoluteUrl, resolveSocialImage } from "@/lib/site";
import { getPostPreview } from "@/lib/writings";

export async function generateMetadata(): Promise<Metadata> {
  const creator = await getPrimaryCreator();
  const title = creator.heroTitle?.trim() || creator.name;
  const description =
    creator.heroSubtitle?.trim() ||
    creator.bio?.trim() ||
    "Essays, ideas, observations and systems.";
  const image = resolveSocialImage(creator.heroImage);

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl("/"),
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl("/"),
      type: "website",
      images: [
        {
          url: image,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function HomePage() {
  const [creator, featuredWritings, followerCount] = await Promise.all([
    getPrimaryCreator(),
    prisma.post.findMany({
      where: {
        status: "published",
        universe: "public",
      },
      include: {
        category: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 3,
    }),
    prisma.follower.count({
      where: {
        status: "active",
      },
    }),
  ]);
  const heroEyebrow = creator.heroEyebrow?.trim() || "Personal Writing System";
  const heroTitle = creator.heroTitle?.trim() || creator.name;
  const heroSubtitle =
    creator.heroSubtitle?.trim() || creator.bio?.trim() || "Love, life, laughter and systems.";
  const heroImageSrc = creator.heroImage
    ? `${creator.heroImage}?v=${creator.updatedAt.getTime()}`
    : null;
  const heroImageIsSvg = creator.heroImage?.toLowerCase().endsWith(".svg");

  return (
    <PageWrapper>
      <>
        <Container>
          <section>
            <div
              className={`relative overflow-hidden rounded-[2rem] ${
                creator.heroImage
                  ? ""
                  : "hero-cover-blend min-h-[24rem] md:min-h-[28rem]"
              }`}
            >
              {heroImageSrc ? (
                <Image
                  src={heroImageSrc}
                  alt={creator.heroImageAlt?.trim() || heroTitle}
                  width={2000}
                  height={1200}
                  priority
                  unoptimized={heroImageIsSvg}
                  className="block h-auto w-full"
                  sizes="(max-width: 768px) 100vw, 80rem"
                />
              ) : null}
              <div
                className={
                  creator.heroImage
                    ? "absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(164,120,63,0.18),transparent_28%),linear-gradient(90deg,rgba(7,17,31,0.56)_0%,rgba(7,17,31,0.28)_24%,rgba(7,17,31,0.1)_46%,rgba(7,17,31,0.02)_72%)]"
                    : "absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,31,0.05)_0%,rgba(7,17,31,0.12)_42%,rgba(7,17,31,0.62)_100%)]"
                }
              />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 md:p-10">
                <div className="max-w-[18rem] sm:max-w-[24rem] md:max-w-3xl">
                  <p className="pl-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white/70 sm:pl-0 sm:text-xs sm:tracking-[0.28em]">
                    {heroEyebrow}
                  </p>

                  <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:mt-4 sm:text-5xl md:text-6xl">
                    {heroTitle}
                  </h1>

                  <p className="mt-3 max-w-[17rem] pl-2 text-base leading-6 text-white/78 sm:mt-5 sm:max-w-xl sm:pl-0 sm:text-lg sm:leading-8 md:max-w-2xl md:text-xl md:leading-9">
                    {heroSubtitle}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {siteFeatures.followEnabled && (
                <FollowButton
                  className="inline-flex h-[2.5rem] min-w-[7.0rem] items-center justify-center rounded-full border border-gray-300 px-5 text-sm font-medium text-gray-900 no-underline transition-colors hover:border-gray-900"
                >
                  Follow
                </FollowButton>
              )}

              {siteFeatures.followEnabled && (
                <div className="inline-flex h-[2.5rem] min-w-[7.0rem] items-center justify-center gap-2.5 rounded-full border border-gray-300 px-4">
                  <span className="text-lg font-medium tracking-tight text-gray-950">
                    {followerCount}
                  </span>
                  <span className="text-sm font-medium text-gray-600">
                    Followers
                  </span>
                </div>
              )}
            </div>
          </section>

          <section className="mt-20 border-t border-gray-200 pt-12">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
                  Public universe
                </p>

                <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-950 md:text-3xl">
                  Latest writings
                </h2>

                <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
                  Begin with the latest chapter, or move deeper into the
                  writings as the universe keeps unfolding.
                </p>
              </div>

              <Link
                href="/writings"
                className="inline-flex h-[2.5rem] items-center justify-center rounded-full bg-[#0a192f] px-5 text-sm font-medium !text-white no-underline transition-colors hover:bg-[#13294b]"
              >
                Go deeper
              </Link>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featuredWritings.map((writing) => (
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
          </section>
        </Container>
        <SiteFooter />
      </>
    </PageWrapper>
  );
}
      
