import Link from "next/link";
import { updateCreatorBranding } from "@/app/admin/actions";
import { prisma } from "@/lib/prisma";
import { ensureDefaultCategories, getPrimaryCreator } from "@/lib/admin";

function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note: string;
}) {
  return (
    <div className="rounded-3xl border border-[#13294b] bg-[#0a192f] p-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/65">
        {label}
      </p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-2 text-sm text-white/78">{note}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  await ensureDefaultCategories();
  const creator = await getPrimaryCreator();
  const heroPreviewSrc = creator.heroImage
    ? `${creator.heroImage}?v=${creator.updatedAt.getTime()}`
    : null;

  const [postCount, publishedCount, draftCount, publicCount, unfilteredCount, categoryCount, followerCount, premiumCount, letterRequestCount, recentPosts] =
    await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: "published" } }),
      prisma.post.count({ where: { status: "draft" } }),
      prisma.post.count({ where: { status: "published", universe: "public" } }),
      prisma.post.count({ where: { status: "published", universe: "unfiltered" } }),
      prisma.category.count(),
      prisma.follower.count({ where: { status: "active" } }),
      prisma.subscriber.count({ where: { tier: "premium" } }),
      prisma.letterRequest.count(),
      prisma.post.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: { category: true },
      }),
    ]);

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
          Content Administration
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950">
          Dashboard
        </h1>
        <div className="mt-5">
          <Link
            href="/admin/posts/new"
            className="inline-flex rounded-full bg-[#0a192f] px-5 py-2.5 text-sm font-medium !text-white transition-colors hover:bg-[#13294b]"
          >
            ＋Create post
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
          Homepage and Footer
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
          Hero image, copy and footer status
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">
          Upload an image directly or use a public path like <code>/admin-hero-sample.svg</code>.
        </p>

        <form action={updateCreatorBranding} className="mt-6 grid gap-4">
          <input
            name="heroEyebrow"
            defaultValue={creator.heroEyebrow ?? ""}
            placeholder="Personal Writing System"
            className="rounded-2xl border border-gray-300 px-4 py-3 outline-none transition-colors focus:border-[#0a192f]"
          />
          <input
            name="heroTitle"
            defaultValue={creator.heroTitle ?? ""}
            placeholder="D•sonofSolomon"
            className="rounded-2xl border border-gray-300 px-4 py-3 outline-none transition-colors focus:border-[#0a192f]"
          />
          <input
            name="heroSubtitle"
            defaultValue={creator.heroSubtitle ?? ""}
            placeholder="Love, life, laughter and systems."
            className="rounded-2xl border border-gray-300 px-4 py-3 outline-none transition-colors focus:border-[#0a192f]"
          />
          <input type="hidden" name="heroImage" value={creator.heroImage ?? ""} />
          {heroPreviewSrc ? (
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-[#f7f5ef] px-3 py-2">
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="relative h-10 w-14">
                  <img
                    src={heroPreviewSrc}
                    alt={creator.heroImageAlt ?? "Current hero image"}
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-900">
                  Hero image
                </p>
                <p className="text-xs text-gray-500">
                  Active on the public homepage.
                </p>
              </div>
            </div>
          ) : null}
          <label className="block">
            <span className="text-sm font-medium text-gray-900">Upload hero image</span>
            <input
              type="file"
              name="heroImageFile"
              accept="image/*"
              className="mt-2 block w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-700 file:mr-4 file:rounded-full file:border-0 file:bg-[#0a192f] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
            />
          </label>
          <details className="rounded-2xl border border-gray-200 px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              Advanced: use a manual image path
            </summary>
            <input
              name="heroImageOverride"
              defaultValue={creator.heroImage ?? ""}
              placeholder="/admin-hero-sample.svg"
              className="mt-3 w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition-colors focus:border-[#0a192f]"
            />
          </details>
          <input
            name="heroImageAlt"
            defaultValue={creator.heroImageAlt ?? ""}
            placeholder="Hero image description"
            className="rounded-2xl border border-gray-300 px-4 py-3 outline-none transition-colors focus:border-[#0a192f]"
          />
          <input
            name="currentWorkingOn"
            defaultValue={creator.currentWorkingOn ?? ""}
            placeholder="The next chapter in the D•sonofSolomon writing system."
            className="rounded-2xl border border-gray-300 px-4 py-3 outline-none transition-colors focus:border-[#0a192f]"
          />
          <div>
            <button
              type="submit"
              className="rounded-full bg-[#0a192f] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#13294b]"
            >
              Save homepage and footer
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Posts" value={postCount} note="Total writings in the system" />
        <StatCard label="Published" value={publishedCount} note="Published across both universes" />
        <StatCard label="Drafts" value={draftCount} note="Still in progress" />
        <StatCard label="Writings" value={publicCount} note="Published to the public universe" />
        <StatCard label="Unfiltered" value={unfilteredCount} note="Published to the premium universe" />
        <StatCard label="Categories" value={categoryCount} note="Controlled writing taxonomy" />
        <StatCard label="Followers" value={followerCount} note="Active push notification followers" />
        <StatCard label="Premium" value={premiumCount} note="Reserved for the later premium layer" />
        <StatCard label="Letters" value={letterRequestCount} note="Dormant premium request queue" />
        <StatCard label="Audience" value={followerCount + premiumCount} note="Combined reach across followers and premium members" />
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
              Recent Activity
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
              Recently updated posts
            </h2>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Universe</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm text-gray-700">
              {recentPosts.map((post) => (
                <tr key={post.id}>
                  <td className="px-4 py-4 font-medium text-gray-950">{post.title}</td>
                  <td className="px-4 py-4 capitalize">{post.status}</td>
                  <td className="px-4 py-4 capitalize">{post.universe}</td>
                  <td className="px-4 py-4">{post.category?.name ?? "Unassigned"}</td>
                  <td className="px-4 py-4">
                    {post.updatedAt.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="text-[#0a192f] hover:text-[#13294b]"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
