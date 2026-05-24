import Link from "next/link";
import { updateCreatorBranding } from "@/app/admin/actions";
import {
  AdminMetricCard,
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  adminFileInputClass,
  adminInputClass,
  adminPrimaryButtonClass,
  StatusPill,
} from "@/components/admin/AdminUI";
import { prisma } from "@/lib/prisma";
import { ensureDefaultCategories, getPrimaryCreator } from "@/lib/admin";
import { siteFeatures } from "@/lib/features";

function analyticsDelegatesAvailable() {
  return Boolean(
    prisma.pageView &&
      prisma.postView &&
      prisma.readingSession &&
      prisma.subscriberAnalyticsEvent,
  );
}

export default async function AdminDashboardPage() {
  await ensureDefaultCategories();
  const creator = await getPrimaryCreator();
  const heroPreviewSrc = creator.heroImage
    ? `${creator.heroImage}?v=${creator.updatedAt.getTime()}`
    : null;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const creatorWhere = { creatorId: creator.id };

  const coreDashboardData = await Promise.all([
    prisma.post.count({ where: creatorWhere }),
    prisma.post.count({ where: { ...creatorWhere, status: "published" } }),
    prisma.post.count({ where: { ...creatorWhere, status: "draft" } }),
    prisma.post.count({
      where: { ...creatorWhere, status: "published", universe: "public" },
    }),
    prisma.post.count({
      where: { ...creatorWhere, status: "published", universe: "unfiltered" },
    }),
    prisma.category.count({ where: creatorWhere }),
    prisma.follower.count({ where: { ...creatorWhere, status: "active" } }),
    prisma.subscriber.count({ where: { ...creatorWhere, tier: "premium" } }),
    prisma.letterRequest.count({ where: creatorWhere }),
    prisma.post.findMany({
      where: creatorWhere,
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { category: true },
    }),
  ]);

  const [
    postCount,
    publishedCount,
    draftCount,
    publicCount,
    unfilteredCount,
    categoryCount,
    followerCount,
    premiumCount,
    letterRequestCount,
    recentPosts,
  ] = coreDashboardData;

  const [
    totalPageViews,
    recentPageViews,
    totalPostViews,
    recentPostViews,
    completedReads,
    readingStats,
    subscriberEvents,
    recentSubscriberEvents,
    analyticsPosts,
  ] = analyticsDelegatesAvailable()
    ? await Promise.all([
        prisma.pageView.count({ where: { creatorId: creator.id } }),
        prisma.pageView.count({
          where: {
            creatorId: creator.id,
            createdAt: { gte: sevenDaysAgo },
          },
        }),
        prisma.postView.count({ where: { creatorId: creator.id } }),
        prisma.postView.count({
          where: {
            creatorId: creator.id,
            createdAt: { gte: sevenDaysAgo },
          },
        }),
        prisma.readingSession.count({
          where: {
            creatorId: creator.id,
            completed: true,
          },
        }),
        prisma.readingSession.aggregate({
          where: { creatorId: creator.id },
          _avg: {
            maxProgress: true,
            secondsSpent: true,
          },
        }),
        prisma.subscriberAnalyticsEvent.count({
          where: { creatorId: creator.id },
        }),
        prisma.subscriberAnalyticsEvent.count({
          where: {
            creatorId: creator.id,
            createdAt: { gte: sevenDaysAgo },
          },
        }),
        prisma.post.findMany({
          where: {
            creatorId: creator.id,
            status: "published",
          },
          include: {
            _count: {
              select: {
                postViews: true,
                readingSessions: true,
              },
            },
          },
        }),
      ])
    : [
        0,
        0,
        0,
        0,
        0,
        { _avg: { maxProgress: 0, secondsSpent: 0 } },
        0,
        0,
        [],
      ];
  const averageProgress = Math.round(readingStats._avg.maxProgress ?? 0);
  const averageSecondsSpent = Math.round(readingStats._avg.secondsSpent ?? 0);
  const topViewedPosts = analyticsPosts
    .sort((first, second) => second._count.postViews - first._count.postViews)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Content Administration"
        title="Dashboard"
        description="A focused command surface for publishing, audience signals, and the public face of the writing system."
        action={
          <Link
            href="/admin/posts/new"
            className={adminPrimaryButtonClass}
          >
            Create post
          </Link>
        }
      />

      <AdminPanel>
        <AdminPanelHeader
          eyebrow="Overview"
          title="Content and audience snapshot"
          description="The current state of publishing, taxonomy, and audience activity."
        />
        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <AdminMetricCard label="Posts" value={postCount} note="Total writings" />
          <AdminMetricCard label="Published" value={publishedCount} note="Across both universes" />
          <AdminMetricCard label="Drafts" value={draftCount} note="Still in progress" />
          <AdminMetricCard label="Writings" value={publicCount} note="Public universe" />
          {siteFeatures.unfilteredEnabled ? (
            <AdminMetricCard label="Unfiltered" value={unfilteredCount} note="Premium universe" />
          ) : null}
          <AdminMetricCard label="Categories" value={categoryCount} note="Controlled taxonomy" />
          <AdminMetricCard label="Followers" value={followerCount} note="Push audience" />
          {siteFeatures.premiumEnabled ? (
            <AdminMetricCard label="Premium" value={premiumCount} note="Premium members" />
          ) : null}
          {siteFeatures.letterRequestsEnabled ? (
            <AdminMetricCard label="Letters" value={letterRequestCount} note="Request queue" />
          ) : null}
          <AdminMetricCard label="Audience" value={followerCount + premiumCount} note="Combined reach" />
        </div>
      </AdminPanel>

      <AdminPanel>
        <AdminPanelHeader
          eyebrow="Analytics"
          title="Website, reading and subscriber activity"
          description="A compact read on traffic, attention, and audience movement."
        />

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <AdminMetricCard
            label="Site views"
            value={totalPageViews}
            note={`${recentPageViews} in the last 7 days`}
          />
          <AdminMetricCard
            label="Post views"
            value={totalPostViews}
            note={`${recentPostViews} in the last 7 days`}
          />
          <AdminMetricCard
            label="Completed reads"
            value={completedReads}
            note={`${averageProgress}% average progress`}
          />
          <AdminMetricCard
            label="Subscriber events"
            value={subscriberEvents}
            note={`${recentSubscriberEvents} in the last 7 days`}
          />
        </div>

        <div className="mx-5 mb-5 overflow-hidden rounded-xl border border-gray-100">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold uppercase text-gray-500">
                <th className="px-4 py-3">Top writing</th>
                <th className="px-4 py-3">Universe</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Reading sessions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm text-gray-700">
              {topViewedPosts.length > 0 ? (
                topViewedPosts.map((post) => (
                  <tr key={post.id}>
                    <td className="px-4 py-4 font-medium text-gray-950">
                      {post.title}
                    </td>
                    <td className="px-4 py-4">
                      <StatusPill>{post.universe}</StatusPill>
                    </td>
                    <td className="px-4 py-4">{post._count.postViews}</td>
                    <td className="px-4 py-4">{post._count.readingSessions}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-4 text-gray-500" colSpan={4}>
                    No post views recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="px-5 pb-5 text-sm text-gray-600">
          Average reading time recorded: {averageSecondsSpent} seconds.
        </p>
      </AdminPanel>

      <AdminPanel>
        <AdminPanelHeader
          eyebrow="Homepage and footer"
          title="Hero image, copy and footer status"
          description="Control the first public impression and the small status line that anchors the site."
        />

        <form action={updateCreatorBranding} className="grid gap-4 p-5">
          <input
            name="heroEyebrow"
            defaultValue={creator.heroEyebrow ?? ""}
            placeholder="Personal Writing System"
            className={adminInputClass}
          />
          <input
            name="heroTitle"
            defaultValue={creator.heroTitle ?? ""}
            placeholder="D•sonofSolomon"
            className={adminInputClass}
          />
          <input
            name="heroSubtitle"
            defaultValue={creator.heroSubtitle ?? ""}
            placeholder="Love, life, laughter and systems."
            className={adminInputClass}
          />
          <input type="hidden" name="heroImage" value={creator.heroImage ?? ""} />
          {heroPreviewSrc ? (
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
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
              className={adminFileInputClass}
            />
          </label>
          <details className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              Advanced: use a manual image path
            </summary>
            <input
              name="heroImageOverride"
              defaultValue={creator.heroImage ?? ""}
              placeholder="/admin-hero-sample.svg"
              className={adminInputClass}
            />
          </details>
          <input
            name="heroImageAlt"
            defaultValue={creator.heroImageAlt ?? ""}
            placeholder="Hero image description"
            className={adminInputClass}
          />
          <input
            name="currentWorkingOn"
            defaultValue={creator.currentWorkingOn ?? ""}
            placeholder="The next chapter in the D•sonofSolomon writing system."
            className={adminInputClass}
          />
          <div>
            <button
              type="submit"
              className={adminPrimaryButtonClass}
            >
              Save homepage and footer
            </button>
          </div>
        </form>
      </AdminPanel>

      <AdminPanel>
        <AdminPanelHeader
          eyebrow="Recent activity"
          title="Recently updated posts"
        />

        <div className="overflow-x-auto">
          <table className="min-w-[46rem] divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold uppercase text-gray-500">
                <th className="whitespace-nowrap px-4 py-3">Title</th>
                <th className="whitespace-nowrap px-4 py-3">Status</th>
                <th className="whitespace-nowrap px-4 py-3">Universe</th>
                <th className="whitespace-nowrap px-4 py-3">Category</th>
                <th className="whitespace-nowrap px-4 py-3">Updated</th>
                <th className="whitespace-nowrap px-4 py-3">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm text-gray-700">
              {recentPosts.map((post) => (
                <tr key={post.id} className="transition-colors hover:bg-gray-50/70">
                  <td className="w-[13rem] px-4 py-4 font-medium text-gray-950">{post.title}</td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <StatusPill tone={post.status === "published" ? "success" : "warning"}>
                      {post.status}
                    </StatusPill>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <StatusPill>{post.universe}</StatusPill>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">{post.category?.name ?? "Unassigned"}</td>
                  <td className="whitespace-nowrap px-4 py-4">
                    {post.updatedAt.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="font-medium text-[#0a192f] hover:text-[#13294b]"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
}
