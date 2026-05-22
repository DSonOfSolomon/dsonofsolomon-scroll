import Link from "next/link";
import { createPost } from "@/app/admin/actions";
import {
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  adminFileInputClass,
  adminInputClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/AdminUI";
import BackToDashboardLink from "@/components/admin/BackToDashboardLink";
import { ensureDefaultCategories } from "@/lib/admin";

export default async function NewPostPage() {
  const categories = await ensureDefaultCategories();

  return (
    <div className="space-y-8">
      <div>
        <BackToDashboardLink />
      </div>

      <AdminPageHeader
        eyebrow="Posts"
        title="Create new post"
        description="Draft, classify, and publish a writing into the right universe."
        action={
          <Link href="/admin/posts" className={adminSecondaryButtonClass}>
            View posts
          </Link>
        }
      />

      <AdminPanel>
        <AdminPanelHeader title="Writing details" />
        <form action={createPost} className="space-y-6 p-5">
        <div className="grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">Title</span>
            <input
              name="title"
              required
              className={adminInputClass}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-900">Slug</span>
            <input
              name="slug"
              placeholder="Auto-generated from title if left blank"
              className={adminInputClass}
            />
          </label>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">Chapter label</span>
            <input
              name="chapterLabel"
              placeholder="D•sonofSolomon Chapter I"
              className={adminInputClass}
            />
          </label>
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            Choose whether to save this as a draft or publish it using the
            action buttons below.
          </div>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-900">Universe</span>
          <select
            name="universe"
            defaultValue="public"
            className={adminInputClass}
          >
            <option value="public">Writings</option>
            <option value="unfiltered">Unfiltered</option>
          </select>
        </label>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">Category</span>
            <select
              name="categoryId"
              defaultValue=""
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
            Upload a cover image directly, or use the advanced path field only if you need a manual file path.
          </div>
        </div>

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
            placeholder="/uploads/cover-image.jpg"
            className={adminInputClass}
          />
        </details>

        <label className="block">
          <span className="text-sm font-medium text-gray-900">Excerpt</span>
          <textarea
            name="excerpt"
            required
            rows={3}
            className={adminInputClass}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-900">Content</span>
          <textarea
            name="content"
            required
            rows={14}
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
