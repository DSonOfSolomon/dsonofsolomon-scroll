import Link from "next/link";
import { createPost } from "@/app/admin/actions";
import BackToDashboardLink from "@/components/admin/BackToDashboardLink";
import { ensureDefaultCategories } from "@/lib/admin";

export default async function NewPostPage() {
  const categories = await ensureDefaultCategories();

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <BackToDashboardLink />
      </div>

      <section className="rounded-3xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
              Posts
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
              Create new post
            </h2>
          </div>

          <Link href="/admin/posts" className="text-sm text-gray-600 hover:text-gray-950">
            View posts
          </Link>
        </div>

        <form action={createPost} className="mt-8 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">Title</span>
            <input
              name="title"
              required
              className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition-colors focus:border-[#0a192f]"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-900">Slug</span>
            <input
              name="slug"
              placeholder="Auto-generated from title if left blank"
              className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition-colors focus:border-[#0a192f]"
            />
          </label>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">Chapter label</span>
            <input
              name="chapterLabel"
              placeholder="D•sonofSolomon Chapter I"
              className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition-colors focus:border-[#0a192f]"
            />
          </label>
          <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600">
            Choose whether to save this as a draft or publish it using the
            action buttons below.
          </div>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-900">Universe</span>
          <select
            name="universe"
            defaultValue="public"
            className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none transition-colors focus:border-[#0a192f]"
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
              className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none transition-colors focus:border-[#0a192f]"
            >
              <option value="">Unassigned</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600">
            Upload a cover image directly, or use the advanced path field only if you need a manual file path.
          </div>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-900">Upload cover image</span>
          <input
            type="file"
            name="coverImageFile"
            accept="image/*"
            className="mt-2 block w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-700 file:mr-4 file:rounded-full file:border-0 file:bg-[#0a192f] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
          />
        </label>

        <details className="rounded-2xl border border-gray-200 px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Advanced: use a manual cover image path
          </summary>
          <input
            name="coverImageOverride"
            placeholder="/uploads/cover-image.jpg"
            className="mt-3 w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition-colors focus:border-[#0a192f]"
          />
        </details>

        <label className="block">
          <span className="text-sm font-medium text-gray-900">Excerpt</span>
          <textarea
            name="excerpt"
            required
            rows={3}
            className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition-colors focus:border-[#0a192f]"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-900">Content</span>
          <textarea
            name="content"
            required
            rows={14}
            className="mt-2 w-full rounded-3xl border border-gray-300 px-4 py-3 outline-none transition-colors focus:border-[#0a192f]"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="submit"
            name="status"
            value="draft"
            className="inline-flex justify-center rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-gray-900 transition-colors hover:border-gray-900"
          >
            Save draft
          </button>
          <button
            type="submit"
            name="status"
            value="published"
            className="inline-flex justify-center rounded-full bg-[#0a192f] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#13294b]"
          >
            Publish post
          </button>
        </div>
        </form>
      </section>
    </div>
  );
}
