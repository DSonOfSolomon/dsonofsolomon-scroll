type CategoryBadgeProps = {
    label: string;
  };
  
  export default function CategoryBadge({ label }: CategoryBadgeProps) {
    return (
      <span className="inline-flex rounded-full border border-gray-200 bg-transparent px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-gray-600">
        {label}
      </span>
    );
  }
