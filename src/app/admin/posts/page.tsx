import Link from "next/link";
import { deletePost, togglePostStatus } from "@/app/admin/actions";
import BackToDashboardLink from "@/components/admin/BackToDashboardLink";
import { prisma } from "@/lib/prisma";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    include: {
      category: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <BackToDashboardLink />
      </div>

      <section className="rounded-3xl border border-gray-200 bg-white p-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
            Posts
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
            Manage writings
          </h2>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="text-left text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                <th className="px-3 py-3">Title</th>
                <th className="px-3 py-3">Slug</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Universe</th>
                <th className="px-3 py-3">Updated</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="px-3 py-4 font-medium text-gray-950">{post.title}</td>
                  <td className="px-3 py-4 text-gray-500">{post.slug}</td>
                  <td className="px-3 py-4">{post.category?.name ?? "Unassigned"}</td>
                  <td className="px-3 py-4 capitalize">{post.status}</td>
                  <td className="px-3 py-4 capitalize">{post.universe}</td>
                  <td className="px-3 py-4">
                    {post.updatedAt.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="text-[#0a192f] hover:text-[#13294b]"
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
                        <button
                          type="submit"
                          className="text-gray-600 hover:text-gray-950"
                        >
                          {post.status === "published" ? "Unpublish" : "Publish"}
                        </button>
                      </form>

                      <form action={deletePost}>
                        <input type="hidden" name="id" value={post.id} />
                        <button
                          type="submit"
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
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
