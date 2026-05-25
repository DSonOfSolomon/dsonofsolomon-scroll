"use client";

import { useMemo, useState } from "react";
import AdminSubmitButton from "@/components/admin/AdminSubmitButton";
import {
  adminFileInputClass,
  adminInputClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  StatusPill,
} from "@/components/admin/AdminUI";

type CategoryOption = {
  id: string;
  name: string;
};

type SeriesOption = {
  id: string;
  title: string;
};

type PostDefaults = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  status?: string;
  universe?: string;
  chapterLabel?: string | null;
  categoryId?: string | null;
  coverImage?: string | null;
  coverAlt?: string;
  seriesId?: string | null;
  episodeNumber?: number | null;
};

type AdminPostFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  categories: CategoryOption[];
  series: SeriesOption[];
  defaults?: PostDefaults;
  coverPreviewSrc?: string | null;
  showUnfiltered: boolean;
  mode: "create" | "edit";
};

const souloverseLabels: Record<string, string> = {
  public: "Writings",
  series: "Series",
  unfiltered: "Unfiltered",
};

export default function AdminPostForm({
  action,
  categories,
  series,
  defaults,
  coverPreviewSrc,
  showUnfiltered,
  mode,
}: AdminPostFormProps) {
  const [universe, setUniverse] = useState(defaults?.universe ?? "public");
  const selectedLabel = souloverseLabels[universe] ?? "Writings";
  const titleLabel = universe === "series" ? "Episode title" : "Title";
  const slugLabel = universe === "series" ? "Episode slug" : "Slug";
  const contentTitle = useMemo(() => {
    if (universe === "series") {
      return mode === "create" ? "Create series episode" : "Edit series episode";
    }

    if (universe === "unfiltered") {
      return mode === "create" ? "Create unfiltered post" : "Edit unfiltered post";
    }

    return mode === "create" ? "Create writing" : "Edit writing";
  }, [mode, universe]);

  return (
    <form action={action} className="space-y-6 p-5">
      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}

      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <label className="block">
          <span className="text-base font-bold text-gray-950">Souloverse</span>
          <span className="mt-1 block text-sm leading-6 text-gray-600">
            Select Souloverse.
          </span>
          <select
            name="universe"
            value={universe}
            onChange={(event) => setUniverse(event.target.value)}
            className={adminInputClass}
          >
            <option value="public">Writings</option>
            <option value="series">Series</option>
            {showUnfiltered || defaults?.universe === "unfiltered" ? (
              <option value="unfiltered">Unfiltered</option>
            ) : null}
          </select>
        </label>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6a2f]">
              {selectedLabel}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-gray-950">
              {contentTitle}
            </h3>
          </div>
          {defaults?.status ? (
            <div className="text-sm text-gray-600">
              Current status:
              <span className="ml-2">
                <StatusPill tone={defaults.status === "published" ? "success" : "warning"}>
                  {defaults.status}
                </StatusPill>
              </span>
            </div>
          ) : (
            <p className="">
              
            </p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">{titleLabel}</span>
            <input
              name="title"
              required
              defaultValue={defaults?.title ?? ""}
              className={adminInputClass}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-900">{slugLabel}</span>
            <input
              name="slug"
              defaultValue={defaults?.slug ?? ""}
              placeholder="Auto-generated from title if left blank"
              className={adminInputClass}
            />
          </label>
        </div>

        {universe !== "series" ? (
          <label className="block">
            <span className="text-sm font-medium text-gray-900">Chapter label</span>
            <input
              name="chapterLabel"
              defaultValue={defaults?.chapterLabel ?? ""}
              placeholder="D•sonofSolomon Chapter I"
              className={adminInputClass}
            />
          </label>
        ) : null}

        {universe === "series" ? (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div>
              <p className="text-sm font-semibold text-gray-950">Series details</p>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Choose an existing series or start a new one. Episode number is manual and can stay blank.
              </p>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-gray-900">Existing series</span>
                <select
                  name="seriesId"
                  defaultValue={defaults?.seriesId ?? ""}
                  className={adminInputClass}
                >
                  <option value="">Create new or leave unassigned</option>
                  {series.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-900">Episode number</span>
                <input
                  type="number"
                  name="episodeNumber"
                  min="1"
                  inputMode="numeric"
                  defaultValue={defaults?.episodeNumber ?? ""}
                  placeholder="Type the number only"
                  className={adminInputClass}
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-gray-900">New series title</span>
                <input
                  name="newSeriesTitle"
                  placeholder="Only if this starts a new series"
                  className={adminInputClass}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-900">New series slug</span>
                <input
                  name="newSeriesSlug"
                  placeholder="Auto-generated if left blank"
                  className={adminInputClass}
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-medium text-gray-900">New series description</span>
              <textarea
                name="newSeriesDescription"
                rows={2}
                className={adminInputClass}
              />
            </label>
          </div>
        ) : null}

        <label className="block">
          <span className="text-sm font-medium text-gray-900">Category</span>
          <select
            name="categoryId"
            defaultValue={defaults?.categoryId ?? ""}
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

        <input type="hidden" name="coverImage" value={defaults?.coverImage ?? ""} />
        {coverPreviewSrc ? (
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="relative h-10 w-14">
                <img
                  src={coverPreviewSrc}
                  alt={defaults?.coverAlt ?? defaults?.title ?? "Cover image"}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-900">
                Cover image
              </p>
              <p className="text-xs text-gray-500">Active on this piece.</p>
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
            defaultValue={defaults?.coverImage ?? ""}
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
            defaultValue={defaults?.excerpt ?? ""}
            className={adminInputClass}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-900">Content</span>
          <textarea
            name="content"
            required
            rows={14}
            defaultValue={defaults?.content ?? ""}
            className={adminInputClass}
          />
        </label>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <AdminSubmitButton
          name="status"
          value="draft"
          className={adminSecondaryButtonClass}
          pendingLabel="Saving draft..."
        >
          Save draft
        </AdminSubmitButton>
        <AdminSubmitButton
          name="status"
          value="published"
          className={adminPrimaryButtonClass}
          pendingLabel="Publishing..."
        >
          Publish post
        </AdminSubmitButton>
      </div>
    </form>
  );
}
