import type { Metadata } from "next";
import Container from "@/components/site/Container";
import PageWrapper from "@/components/site/PageWrapper";
import CategoryBadge from "@/components/writings/CategoryBadge";
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

function formatArchiveDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getReadingTime(content: string) {
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
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
  const leadWriting = writings[0];
  const remainingWritings = writings.slice(1);

  return (
    <PageWrapper>
      <Container className="max-w-[78rem]">
        <section>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
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
            </div>

            <div className="inline-flex h-[2.7rem] items-center rounded-full border border-gray-200 px-4 text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </section>

        <section className="mt-12">
          {writings.length > 0 ? (
            <>
              {leadWriting && (
                <Link
                  href={`/writings/${leadWriting.slug}`}
                  className="block rounded-[2rem] border border-gray-200 bg-[#f7f5ef] p-7 no-underline transition-colors hover:border-gray-400 md:p-9"
                >
                  <article className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.95fr)] lg:items-end">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
                        {currentPage === 1 ? "Latest chapter" : "From the archive"}
                      </p>

                      <div className="mt-5">
                        <CategoryBadge
                          label={leadWriting.category?.name ?? "Writing"}
                        />
                      </div>

                      {leadWriting.chapterLabel && (
                        <p className="mt-5 text-xs uppercase tracking-[0.22em] text-gray-500">
                          {leadWriting.chapterLabel}
                        </p>
                      )}

                      <h2 className="mt-5 max-w-[44rem] text-3xl font-semibold tracking-tight text-gray-950 md:text-[3.1rem] md:leading-[1.05]">
                        {leadWriting.title}
                      </h2>

                      <p className="mt-5 max-w-[40rem] text-lg leading-8 text-gray-600">
                        {getPostPreview(leadWriting.excerpt, leadWriting.content)}
                        <span className="text-gray-400">...</span>
                      </p>
                    </div>

                    <div className="border-t border-gray-200 pt-5 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
                      <div className="space-y-3 text-sm text-gray-500">
                        <p>D•sonofSolomon</p>
                        <p>{formatArchiveDate(leadWriting.publishedAt ?? leadWriting.createdAt)}</p>
                        <p>{getReadingTime(leadWriting.content)} min read</p>
                      </div>

                      <p className="mt-6 inline-flex text-sm font-medium text-[#0a192f] transition-colors hover:text-[#13294b]">
                        Enter the piece
                      </p>
                    </div>
                  </article>
                </Link>
              )}

              <div className="mt-8">
                {remainingWritings.map((writing) => (
                  <article
                    key={writing.slug}
                    className="border-t border-gray-200 py-8 first:border-t-0 first:pt-0"
                  >
                    <div className="grid gap-5 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-8">
                      <div className="space-y-3 text-sm text-gray-500">
                        <CategoryBadge label={writing.category?.name ?? "Writing"} />
                        {writing.chapterLabel && (
                          <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
                            {writing.chapterLabel}
                          </p>
                        )}
                        <p>{formatArchiveDate(writing.publishedAt ?? writing.createdAt)}</p>
                      </div>

                      <div>
                        <Link href={`/writings/${writing.slug}`} className="group no-underline">
                          <h3 className="text-2xl font-semibold tracking-tight text-gray-950 transition-colors group-hover:text-[#13294b]">
                            {writing.title}
                          </h3>

                          <p className="mt-4 max-w-[44rem] text-base leading-8 text-gray-600">
                            {getPostPreview(writing.excerpt, writing.content)}
                            <span className="text-gray-400">...</span>
                          </p>

                          <p className="mt-5 inline-flex text-sm font-medium text-[#0a192f] transition-colors group-hover:text-[#13294b]">
                            Continue reading
                          </p>
                        </Link>
                      </div>
                    </div>
                  </article>
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
