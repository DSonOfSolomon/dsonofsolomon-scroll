"use client";

import CategoryBadge from "@/components/writings/CategoryBadge";
import SeriesAccessLink from "@/components/series/SeriesAccessLink";

type SeriesPreviewCardProps = {
  href: string;
  seriesTitle: string;
  episodeTitle: string;
  excerpt: string;
  category: string;
  episodeLabel?: string;
};

export default function SeriesPreviewCard({
  href,
  seriesTitle,
  episodeTitle,
  excerpt,
  category,
  episodeLabel,
}: SeriesPreviewCardProps) {
  return (
    <SeriesAccessLink
      href={href}
      className="block rounded-2xl border border-gray-200 p-6 transition-colors hover:border-gray-400"
    >
      <article>
        <CategoryBadge label={category} />

        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-950">
          {seriesTitle}
        </p>

        {episodeLabel ? (
          <p className="mt-5 text-xs uppercase tracking-[0.22em] text-gray-500">
            {episodeLabel}
          </p>
        ) : null}

        <h3 className="mt-4 text-xl font-semibold tracking-tight text-[#8a6a2f]">
          {episodeTitle}
        </h3>

        <p className="mt-3 overflow-hidden text-sm leading-7 text-gray-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4]">
          {excerpt}
          <span className="text-gray-400">...</span>
          <span className="font-semibold text-[#0a192f]">immerse</span>
        </p>
      </article>
    </SeriesAccessLink>
  );
}
