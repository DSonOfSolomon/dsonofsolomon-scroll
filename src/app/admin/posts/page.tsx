import Link from "next/link";
import {
  deletePost,
  notifyFollowersForPost,
  togglePostStatus,
} from "@/app/admin/actions";
import AdminSubmitButton from "@/components/admin/AdminSubmitButton";
import {
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  adminPrimaryButtonClass,
  StatusPill,
} from "@/components/admin/AdminUI";
import BackToDashboardLink from "@/components/admin/BackToDashboardLink";
import { siteFeatures } from "@/lib/features";
import { prisma } from "@/lib/prisma";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    include: {
      category: true,
      series: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <BackToDashboardLink />
      </div>

      <AdminPageHeader
        eyebrow="Content"
        title="Manage Souloverse"
        description="Review writings, series episodes, universe placement, taxonomy, and publishing state from one focused table."
        action={
          <Link href="/admin/posts/new" className={adminPrimaryButtonClass}>
            Create post
          </Link>
        }
      />

      <AdminPanel>
        <AdminPanelHeader title="Content library" />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold uppercase text-gray-500">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Universe</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm text-gray-700">
              {posts.map((post) => (
                <tr key={post.id} className="transition-colors hover:bg-gray-50/70">
                  <td className="px-4 py-4 font-medium text-gray-950">
                    <div>{post.title}</div>
                    {post.series ? (
                      <div className="mt-1 text-xs font-medium text-gray-500">
                        {post.series.title}
                        {post.episodeNumber ? ` - Episode ${post.episodeNumber}` : ""}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 text-gray-500">{post.slug}</td>
                  <td className="px-4 py-4">{post.category?.name ?? "Unassigned"}</td>
                  <td className="px-4 py-4">
                    <StatusPill tone={post.status === "published" ? "success" : "warning"}>
                      {post.status}
                    </StatusPill>
                  </td>
                  <td className="px-4 py-4">
                    <StatusPill>{post.universe}</StatusPill>
                  </td>
                  <td className="px-4 py-4">
                    {post.updatedAt.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="font-medium text-[#0a192f] hover:text-[#13294b]"
                      >
                        Edit
                      </Link>

                      <form action={togglePostStatus}>
                        <input type="hidden" name="id" value={post.id} />
                        <input
                          type="hidden"
                          name="nextStatus"
                          value={post.status === "published" ? "draft" : "published"}
                        />
                        <AdminSubmitButton
                          className="cursor-pointer text-gray-600 hover:text-gray-950"
                          pendingLabel="Updating..."
                        >
                          {post.status === "published" ? "Unpublish" : "Publish"}
                        </AdminSubmitButton>
                      </form>

                      <form action={deletePost}>
                        <input type="hidden" name="id" value={post.id} />
                        <AdminSubmitButton
                          className="cursor-pointer text-red-600 hover:text-red-700"
                          pendingLabel="Deleting..."
                        >
                          Delete
                        </AdminSubmitButton>
                      </form>

                      {siteFeatures.pushNotificationsEnabled &&
                      post.status === "published" &&
                      post.universe === "public" ? (
                        <form action={notifyFollowersForPost}>
                          <input type="hidden" name="id" value={post.id} />
                          <AdminSubmitButton
                            className="cursor-pointer text-[#8a6a2f] hover:text-[#6f5525]"
                            pendingLabel="Sending..."
                          >
                            Notify followers
                          </AdminSubmitButton>
                        </form>
                      ) : null}
                    </div>
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
