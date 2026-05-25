import Link from "next/link";
import CategoryBadge from "@/components/writings/CategoryBadge";

type WritingCardProps = {
  title: string;
  excerpt: string;
  slug: string;
  category: string;
  chapterLabel?: string;
  basePath?: string;
};

export default function WritingCard({
  title,
  excerpt,
  slug,
  category,
  chapterLabel,
  basePath = "/writings",
}: WritingCardProps) {
  return (
    <Link
      href={`${basePath}/${slug}`}
      className="block rounded-2xl border border-gray-200 p-6 transition-colors hover:border-gray-400"
    >
      <article>
        <CategoryBadge label={category} />

        {chapterLabel && (
          <p className="mt-4 text-xs uppercase tracking-[0.22em] text-gray-500">
            {chapterLabel}
          </p>
        )}

        <h3 className="mt-4 text-xl font-semibold tracking-tight text-[#8a6a2f]">
          {title}
        </h3>

        <p className="mt-3 overflow-hidden text-sm leading-7 text-gray-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4]">
          {excerpt}
          <span className="text-gray-400">...</span>
          <span className="font-semibold text-[#0a192f]">immerse</span>
        </p>
      </article>
    </Link>
  );
}
