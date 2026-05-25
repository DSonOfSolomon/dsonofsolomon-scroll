import Link from "next/link";
import CategoryBadge from "@/components/writings/CategoryBadge";

type WritingCardProps = {
  title: string;
  excerpt: string;
  slug: string;
  category: string;
  chapterLabel?: string;
  basePath?: string;
  actionLabel?: string;
};

export default function WritingCard({
  title,
  excerpt,
  slug,
  category,
  chapterLabel,
  basePath = "/writings",
  actionLabel = "Continue reading",
}: WritingCardProps) {
  return (
    <Link
      href={`${basePath}/${slug}`}
      className="block rounded-2xl border border-gray-200 p-6 transition-colors hover:border-gray-400"
    >
      <article>
        <CategoryBadge label={category} />

        {chapterLabel && (
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-[#8a6a2f]">
            {chapterLabel}
          </p>
        )}

        <h3 className="mt-4 text-xl font-semibold tracking-tight text-gray-950">
          {title}
        </h3>

        <p className="mt-3 overflow-hidden text-sm leading-7 text-gray-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4]">
          {excerpt}
          <span className="text-gray-400">...more</span>
        </p>

        <p className="mt-5 inline-flex text-sm font-medium text-[#0a192f] transition-colors hover:text-[#13294b]">
          {actionLabel}
        </p>
      </article>
    </Link>
  );
}
