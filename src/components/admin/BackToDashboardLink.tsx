import Link from "next/link";

export default function BackToDashboardLink() {
  return (
    <Link
      href="/admin"
      className="inline-flex min-h-10 items-center rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:text-gray-950"
    >
      Back to dashboard
    </Link>
  );
}
