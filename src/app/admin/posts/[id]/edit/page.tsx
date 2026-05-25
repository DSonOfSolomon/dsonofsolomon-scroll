import Link from "next/link";
import { notFound } from "next/navigation";
import { updatePost } from "@/app/admin/actions";
import AdminPostForm from "@/components/admin/AdminPostForm";
import {
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  adminSecondaryButtonClass,
} from "@/components/admin/AdminUI";
import BackToDashboardLink from "@/components/admin/BackToDashboardLink";
import { ensureDefaultCategories, getPrimaryCreator } from "@/lib/admin";
import { siteFeatures } from "@/lib/features";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;

  const [post, categories, creator] = await Promise.all([
    prisma.post.findUnique({ where: { id } }),
    ensureDefaultCategories(),
    getPrimaryCreator(),
  ]);

  if (!post) {
    notFound();
  }

  const series = await prisma.series.findMany({
    where: {
      creatorId: creator.id,
    },
    orderBy: {
      title: "asc",
    },
    select: {
      id: true,
      title: true,
    },
  });

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
        description="Change the Souloverse placement first, then update the fields for that format."
        action={
          <Link href="/admin/posts" className={adminSecondaryButtonClass}>
            View posts
          </Link>
        }
      />

      <AdminPanel>
        <AdminPanelHeader title={post.title} />
        <AdminPostForm
          action={updatePost}
          categories={categories}
          series={series}
          coverPreviewSrc={coverPreviewSrc}
          showUnfiltered={siteFeatures.unfilteredEnabled}
          mode="edit"
          defaults={{
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            status: post.status,
            universe: post.universe,
            chapterLabel: post.chapterLabel,
            categoryId: post.categoryId,
            coverImage: post.coverImage,
            coverAlt: post.title,
            seriesId: post.seriesId,
            episodeNumber: post.episodeNumber,
          }}
        />
      </AdminPanel>
    </div>
  );
}
