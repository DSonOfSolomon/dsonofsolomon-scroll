import BackToDashboardLink from "@/components/admin/BackToDashboardLink";
import {
  deactivateFollower,
  testFollowerNotification,
} from "@/app/admin/actions";
import AdminSubmitButton from "@/components/admin/AdminSubmitButton";
import {
  AdminMetricCard,
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  StatusPill,
} from "@/components/admin/AdminUI";
import { getPrimaryCreator } from "@/lib/admin";
import { siteFeatures } from "@/lib/features";
import { prisma } from "@/lib/prisma";

function getBrowserLabel(userAgent: string | null, endpoint: string) {
  const normalizedUserAgent = userAgent?.toLowerCase() ?? "";
  const normalizedEndpoint = endpoint.toLowerCase();

  if (normalizedEndpoint.includes("web.push.apple.com")) {
    return "Safari";
  }

  if (normalizedEndpoint.includes("fcm.googleapis.com")) {
    if (normalizedUserAgent.includes("edg/")) {
      return "Edge";
    }

    if (normalizedUserAgent.includes("chrome/")) {
      return "Chrome";
    }

    return "Chromium";
  }

  if (endpoint.startsWith("test://")) {
    return "Local test";
  }

  if (endpoint.startsWith("in-app://")) {
    return "In-app";
  }

  return "Saved";
}

function formatDate(value: Date | null) {
  if (!value) {
    return "Not yet";
  }

  return value.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const PAGE_SIZE = 50;

function normalizePage(page: string | undefined) {
  const value = Number(page);

  if (!Number.isFinite(value) || value < 1) {
    return 1;
  }

  return Math.floor(value);
}

export default async function AdminFollowersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const requestedPage = normalizePage(page);
  const creator = await getPrimaryCreator();
  const totalFollowerCount = await prisma.follower.count({
    where: {
      creatorId: creator.id,
    },
  });
  const totalPages = Math.max(1, Math.ceil(totalFollowerCount / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const [
    followers,
    activeFollowerCount,
    inactiveFollowerCount,
    notifiedFollowerCount,
    recentDeliveries,
  ] = await Promise.all([
    prisma.follower.findMany({
      where: {
        creatorId: creator.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        notificationDeliveries: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            status: true,
            reason: true,
            createdAt: true,
          },
        },
      },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.follower.count({ where: { creatorId: creator.id, status: "active" } }),
    prisma.follower.count({ where: { creatorId: creator.id, status: "inactive" } }),
    prisma.follower.count({
      where: {
        creatorId: creator.id,
        lastNotifiedAt: {
          not: null,
        },
      },
    }),
    prisma.notificationDelivery.findMany({
      where: {
        creatorId: creator.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      include: {
        post: {
          select: {
            title: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <BackToDashboardLink />
      </div>

      <AdminPageHeader
        eyebrow="Followers"
        title="Reader audience"
        description="Readers who have followed D•sonofSolomon. Browser push is disabled for V1 and can be re-enabled later."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Active" value={activeFollowerCount} note="Currently following" />
        <AdminMetricCard label="Inactive" value={inactiveFollowerCount} note="Manually deactivated" />
        <AdminMetricCard label="Notified" value={notifiedFollowerCount} note="Reserved for notification upgrades" />
      </section>

      <AdminPanel>
        <AdminPanelHeader title="Follower list" />
        <div className="w-full max-w-full overflow-x-scroll overscroll-x-contain px-1 pb-3 [-webkit-overflow-scrolling:touch]">
          <div className="w-max min-w-[78rem] rounded-xl border border-gray-100">
            <table className="w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold uppercase text-gray-500">
                  <th className="whitespace-nowrap px-4 py-3">Source</th>
                  <th className="whitespace-nowrap px-4 py-3">Follower key</th>
                  <th className="whitespace-nowrap px-4 py-3">Status</th>
                  <th className="whitespace-nowrap px-4 py-3">Last delivery</th>
                  <th className="whitespace-nowrap px-4 py-3">Last notified</th>
                  <th className="whitespace-nowrap px-4 py-3">Joined</th>
                  <th className="whitespace-nowrap px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {followers.map((follower) => {
                  const latestDelivery = follower.notificationDeliveries[0];

                  return (
                    <tr key={follower.id} className="transition-colors hover:bg-gray-50/70">
                      <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-950">
                        {getBrowserLabel(follower.userAgent, follower.endpoint)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="max-w-[18rem] truncate font-medium text-gray-950">
                          {follower.endpoint}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusPill tone={follower.status === "active" ? "success" : "neutral"}>
                          {follower.status}
                        </StatusPill>
                      </td>
                      <td className="px-4 py-4">
                        {latestDelivery ? (
                          <div className="space-y-1">
                            <StatusPill
                              tone={
                                latestDelivery.status === "sent"
                                  ? "success"
                                  : latestDelivery.status === "failed"
                                    ? "danger"
                                    : "warning"
                              }
                            >
                              {latestDelivery.status}
                            </StatusPill>
                            <p className="max-w-[14rem] truncate text-xs text-gray-500">
                              {latestDelivery.reason ?? formatDate(latestDelivery.createdAt)}
                            </p>
                          </div>
                        ) : (
                          "Not yet"
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        {formatDate(follower.lastNotifiedAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        {formatDate(follower.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-3">
                          {siteFeatures.pushNotificationsEnabled ? (
                            <form action={testFollowerNotification}>
                              <input type="hidden" name="id" value={follower.id} />
                              <AdminSubmitButton
                                className="cursor-pointer font-medium text-[#0a192f] hover:text-[#13294b]"
                                pendingLabel="Testing..."
                              >
                                Test
                              </AdminSubmitButton>
                            </form>
                          ) : null}

                          {follower.status === "active" ? (
                            <form action={deactivateFollower}>
                              <input type="hidden" name="id" value={follower.id} />
                              <AdminSubmitButton
                                className="cursor-pointer text-red-600 hover:text-red-700"
                                pendingLabel="Deactivating..."
                              >
                                Deactivate
                              </AdminSubmitButton>
                            </form>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {totalPages > 1 ? (
          <div className="flex items-center justify-between gap-4 border-t border-gray-100 px-4 py-4">
            <p className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </p>

            <div className="flex gap-3">
              {hasPreviousPage ? (
                <a
                  href={currentPage - 1 === 1 ? "/admin/followers" : `/admin/followers?page=${currentPage - 1}`}
                  className="inline-flex rounded-full border border-gray-300 bg-transparent px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:border-gray-900"
                >
                  Previous
                </a>
              ) : (
                <span className="inline-flex rounded-full border border-gray-200 bg-transparent px-4 py-2 text-sm font-medium text-gray-400">
                  Previous
                </span>
              )}

              {hasNextPage ? (
                <a
                  href={`/admin/followers?page=${currentPage + 1}`}
                  className="inline-flex rounded-full border border-gray-300 bg-transparent px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:border-gray-900"
                >
                  Next
                </a>
              ) : (
                <span className="inline-flex rounded-full border border-gray-200 bg-transparent px-4 py-2 text-sm font-medium text-gray-400">
                  Next
                </span>
              )}
            </div>
          </div>
        ) : null}
      </AdminPanel>

      {siteFeatures.pushNotificationsEnabled ? (
        <AdminPanel>
          <AdminPanelHeader
            title="Recent notification deliveries"
            description="The latest browser push attempts for published public writings."
          />
          <div className="w-full max-w-full overflow-x-scroll overscroll-x-contain px-1 pb-3 [-webkit-overflow-scrolling:touch]">
            <div className="w-max min-w-[62rem] rounded-xl border border-gray-100">
              <table className="w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-semibold uppercase text-gray-500">
                    <th className="whitespace-nowrap px-4 py-3">Post</th>
                    <th className="whitespace-nowrap px-4 py-3">Status</th>
                    <th className="whitespace-nowrap px-4 py-3">Endpoint</th>
                    <th className="whitespace-nowrap px-4 py-3">Reason</th>
                    <th className="whitespace-nowrap px-4 py-3">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {recentDeliveries.length === 0 ? (
                    <tr>
                      <td className="px-4 py-5 text-gray-500" colSpan={5}>
                        No notification delivery attempts recorded yet.
                      </td>
                    </tr>
                  ) : (
                    recentDeliveries.map((delivery) => (
                      <tr key={delivery.id} className="transition-colors hover:bg-gray-50/70">
                        <td className="px-4 py-4 font-medium text-gray-950">
                          {delivery.post?.title ?? "System event"}
                        </td>
                        <td className="px-4 py-4">
                          <StatusPill
                            tone={
                              delivery.status === "sent"
                                ? "success"
                                : delivery.status === "failed"
                                  ? "danger"
                                  : "warning"
                            }
                          >
                            {delivery.status}
                          </StatusPill>
                        </td>
                        <td className="px-4 py-4">
                          <div className="max-w-[18rem] truncate">
                            {delivery.endpoint ?? "None"}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="max-w-[20rem] truncate">
                            {delivery.reason ??
                              (delivery.statusCode ? `HTTP ${delivery.statusCode}` : "Delivered")}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          {delivery.createdAt.toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </AdminPanel>
      ) : null}
    </div>
  );
}
