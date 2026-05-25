import type { Metadata } from "next";
import Container from "@/components/site/Container";
import EmptyState from "@/components/site/EmptyState";
import PageWrapper from "@/components/site/PageWrapper";
import PremiumGate from "@/components/premium/PremiumGate";
import { siteFeatures } from "@/lib/features";
import WritingCard from "@/components/writings/WritingCard";
import { prisma } from "@/lib/prisma";
import { isPremiumSubscriber } from "@/lib/premium";
import { getPostPreview } from "@/lib/writings";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "D•sonofSolomon Unfiltered",
};

export default async function UnfilteredPage() {
  if (!siteFeatures.unfilteredEnabled) {
    notFound();
  }

  const premium = await isPremiumSubscriber();

  if (!premium) {
    return (
      <PageWrapper>
        <Container>
          <PremiumGate
            title="D•sonofSolomon Unfiltered"
            description="Some reflections are quieter. Some are rawer. Some are reserved. This parallel writing universe is available to premium subscribers only."
            nextPath="/unfiltered"
          />
        </Container>
      </PageWrapper>
    );
  }

  const writings = await prisma.post.findMany({
    where: {
      status: "published",
      universe: "unfiltered",
    },
    include: {
      category: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
  });

  return (
    <PageWrapper>
      <Container>
        <section>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
            Premium Universe
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
            D•sonofSolomon Unfiltered
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
            A parallel stream of more intimate, raw, and reserved reflections.
          </p>
        </section>

        <section className="mt-12 pb-16 md:pb-20">
          {writings.length > 0 ? (
            <div className="space-y-6">
              {writings.map((writing) => (
                <WritingCard
                  key={writing.slug}
                  title={writing.title}
                  excerpt={getPostPreview(writing.excerpt, writing.content)}
                  slug={writing.slug}
                  category={writing.category?.name ?? "Unfiltered"}
                  chapterLabel={writing.chapterLabel ?? undefined}
                  basePath="/unfiltered"
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Unfiltered writings yet"
              message="Published premium reflections will appear here once they are released."
            />
          )}
        </section>
      </Container>
    </PageWrapper>
  );
}
