import Link from "next/link";
import { notFound } from "next/navigation";
import { updatePost } from "@/app/admin/actions";
import {
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  adminFileInputClass,
  adminInputClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  StatusPill,
} from "@/components/admin/AdminUI";
import BackToDashboardLink from "@/components/admin/BackToDashboardLink";
import { prisma } from "@/lib/prisma";
import { ensureDefaultCategories } from "@/lib/admin";
import { siteFeatures } from "@/lib/features";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;

  const [post, categories] = await Promise.all([
    prisma.post.findUnique({ where: { id } }),
    ensureDefaultCategories(),
  ]);

  if (!post) {
    notFound();
  }

  const coverPreviewSrc = post.coverImage
    ? `${post.coverImage}?v=${post.updatedAt.getTime()}`
    : null;

  return (
    <div className="space-y-8">
      <div>
        <BackToDashboardLink />
      </div>

      <AdminPageHeader
        eyebrow="Posts"
        title="Edit post"
        description="Update copy, taxonomy, media, and publishing state without leaving the editor."
        action={
          <Link href="/admin/posts" className={adminSecondaryButtonClass}>
            View posts
          </Link>
        }
      />

      <AdminPanel>
        <AdminPanelHeader title={post.title} />
        <form action={updatePost} className="space-y-6 p-5">
        <input type="hidden" name="id" value={post.id} />

        <div className="grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">Title</span>
            <input
              name="title"
              required
              defaultValue={post.title}
              className={adminInputClass}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-900">Slug</span>
            <input
              name="slug"
              defaultValue={post.slug}
              className={adminInputClass}
            />
          </label>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">Chapter label</span>
            <input
              name="chapterLabel"
              defaultValue={post.chapterLabel ?? ""}
              className={adminInputClass}
            />
          </label>
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            Current status:
            <span className="ml-2">
              <StatusPill tone={post.status === "published" ? "success" : "warning"}>
              {post.status}
              </StatusPill>
            </span>
          </div>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-900">Universe</span>
          <select
            name="universe"
            defaultValue={post.universe}
            className={adminInputClass}
          >
            <option value="public">Writings</option>
            {siteFeatures.unfilteredEnabled || post.universe === "unfiltered" ? (
              <option value="unfiltered">Unfiltered</option>
            ) : null}
          </select>
        </label>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">Category</span>
            <select
              name="categoryId"
              defaultValue={post.categoryId ?? ""}
              className={adminInputClass}
            >
              <option value="">Unassigned</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            Upload a new cover image directly, or use the advanced path field only if you need a manual file path.
          </div>
        </div>

        <input type="hidden" name="coverImage" value={post.coverImage ?? ""} />
        {coverPreviewSrc ? (
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="relative h-10 w-14">
                <img
                  src={coverPreviewSrc}
                  alt={post.title}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-900">
                Cover image
              </p>
              <p className="text-xs text-gray-500">Active on this writing.</p>
            </div>
          </div>
        ) : null}

        <label className="block">
          <span className="text-sm font-medium text-gray-900">Upload cover image</span>
          <input
            type="file"
            name="coverImageFile"
            accept="image/*"
            className={adminFileInputClass}
          />
        </label>

        <details className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Advanced: use a manual cover image path
          </summary>
          <input
            name="coverImageOverride"
            defaultValue={post.coverImage ?? ""}
            className={adminInputClass}
          />
        </details>

        <label className="block">
          <span className="text-sm font-medium text-gray-900">Excerpt</span>
          <textarea
            name="excerpt"
            required
            rows={3}
            defaultValue={post.excerpt}
            className={adminInputClass}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-900">Content</span>
          <textarea
            name="content"
            required
            rows={14}
            defaultValue={post.content}
            className={adminInputClass}
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="submit"
            name="status"
            value="draft"
            className={adminSecondaryButtonClass}
          >
            Save draft
          </button>
          <button
            type="submit"
            name="status"
            value="published"
            className={adminPrimaryButtonClass}
          >
            Publish post
          </button>
        </div>
        </form>
      </AdminPanel>
    </div>
  );
}
