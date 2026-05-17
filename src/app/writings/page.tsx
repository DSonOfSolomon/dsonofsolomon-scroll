import type { Metadata } from "next";
import Container from "@/components/site/Container";
import PageWrapper from "@/components/site/PageWrapper";
import WritingCard from "@/components/writings/WritingCard";
import EmptyState from "@/components/site/EmptyState";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getPostPreview } from "@/lib/writings";

export const metadata: Metadata = {
  title: "Writings",
};

const PAGE_SIZE = 5;

function normalizePage(page: string | undefined) {
  const value = Number(page);

  if (!Number.isFinite(value) || value < 1) {
    return 1;
  }

  return Math.floor(value);
}

export default async function WritingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const requestedPage = normalizePage(page);
  const totalCount = await prisma.post.count({
    where: {
      status: "published",
      universe: "public",
    },
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const writings = await prisma.post.findMany({
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
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <PageWrapper>
      <Container>
        <section>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
            Archive
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
            Writings
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
            A growing collection of thoughts on love, life, laughter and
            systems.
          </p>
        </section>

        <section className="mt-12">
          {writings.length > 0 ? (
            <>
              <div className="space-y-6">
                {writings.map((writing) => (
                  <WritingCard
                    key={writing.slug}
                    title={writing.title}
                    excerpt={getPostPreview(writing.excerpt, writing.content)}
                    slug={writing.slug}
                    category={writing.category?.name ?? "Writings"}
                    chapterLabel={writing.chapterLabel ?? undefined}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-between gap-4 border-t border-gray-200 pt-6">
                  <p className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </p>

                  <div className="flex gap-3">
                    {hasPreviousPage ? (
                      <Link
                        href={currentPage - 1 === 1 ? "/writings" : `/writings?page=${currentPage - 1}`}
                        className="inline-flex rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:border-gray-900"
                      >
                        Previous
                      </Link>
                    ) : (
                      <span className="inline-flex rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-400">
                        Previous
                      </span>
                    )}

                    {hasNextPage ? (
                      <Link
                        href={`/writings?page=${currentPage + 1}`}
                        className="inline-flex rounded-full bg-[#0a192f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#13294b]"
                      >
                        Next
                      </Link>
                    ) : (
                      <span className="inline-flex rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400">
                        Next
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title="No writings yet"
              message="New writings will appear here once they are published."
            />
          )}
        </section>
      </Container>
    </PageWrapper>
  );
}
