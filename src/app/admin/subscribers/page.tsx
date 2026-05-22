import BackToDashboardLink from "@/components/admin/BackToDashboardLink";
import {
  AdminMetricCard,
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  StatusPill,
} from "@/components/admin/AdminUI";
import { prisma } from "@/lib/prisma";

export default async function AdminSubscribersPage() {
  const [followers, followerCount] = await Promise.all([
    prisma.follower.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.follower.count({ where: { status: "active" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <BackToDashboardLink />
      </div>

      <AdminPageHeader
        eyebrow="Followers"
        title="Notification audience"
        description="Device-level push subscriptions created when readers allow notifications from the follow modal."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Followers" value={followerCount} note="Active public readers" />
      </section>

      <AdminPanel>
        <AdminPanelHeader title="Follower list" />
        <div className="-mx-2 overflow-x-auto px-2 pb-2">
          <div className="min-w-[54rem] overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold uppercase text-gray-500">
                <th className="whitespace-nowrap px-4 py-3">Endpoint</th>
                <th className="whitespace-nowrap px-4 py-3">Status</th>
                <th className="whitespace-nowrap px-4 py-3">Browser</th>
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
