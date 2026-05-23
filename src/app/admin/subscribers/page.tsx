import BackToDashboardLink from "@/components/admin/BackToDashboardLink";
import {
  AdminMetricCard,
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  StatusPill,
} from "@/components/admin/AdminUI";
import { getPrimaryCreator } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminSubscribersPage() {
  const creator = await getPrimaryCreator();
  const [followers, activeFollowerCount, inactiveFollowerCount, notifiedFollowerCount] = await Promise.all([
    prisma.follower.findMany({
      where: {
        creatorId: creator.id,
      },
      orderBy: {
        createdAt: "desc",
      },
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
  ]);

  return (
    <div className="space-y-8">
      <div>
        <BackToDashboardLink />
      </div>

      <AdminPageHeader
        eyebrow="Followers"
        title="Notification audience"
        description="Browser notification endpoints created when readers follow the public writings."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Active" value={activeFollowerCount} note="Ready for public post notifications" />
        <AdminMetricCard label="Inactive" value={inactiveFollowerCount} note="Turned off or expired endpoints" />
        <AdminMetricCard label="Notified" value={notifiedFollowerCount} note="Reached by at least one post" />
      </section>

      <AdminPanel>
        <AdminPanelHeader title="Follower list" />
        <div className="-mx-2 overflow-x-auto px-2 pb-2">
          <div className="min-w-[62rem] overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold uppercase text-gray-500">
                <th className="whitespace-nowrap px-4 py-3">Endpoint</th>
                <th className="whitespace-nowrap px-4 py-3">Status</th>
                <th className="whitespace-nowrap px-4 py-3">Browser</th>
                <th className="whitespace-nowrap px-4 py-3">Last notified</th>
                <th className="whitespace-nowrap px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {followers.map((follower) => (
                <tr key={follower.id} className="transition-colors hover:bg-gray-50/70">
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
                    <div className="max-w-[15rem] truncate">
                      {follower.userAgent ?? "Unknown"}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {follower.lastNotifiedAt
                      ? follower.lastNotifiedAt.toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Not yet"}
                  </td>
                  <td className="px-4 py-4">
                    {follower.createdAt.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </AdminPanel>
    </div>
  );
}
