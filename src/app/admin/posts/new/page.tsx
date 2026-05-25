import Link from "next/link";
import { createPost } from "@/app/admin/actions";
import AdminPostForm from "@/components/admin/AdminPostForm";
import {
  AdminPageHeader,
  AdminPanel,
  adminSecondaryButtonClass,
} from "@/components/admin/AdminUI";
import BackToDashboardLink from "@/components/admin/BackToDashboardLink";
import { ensureDefaultCategories, getPrimaryCreator } from "@/lib/admin";
import { siteFeatures } from "@/lib/features";
import { prisma } from "@/lib/prisma";

export default async function NewPostPage() {
  const [categories, creator] = await Promise.all([
    ensureDefaultCategories(),
    getPrimaryCreator(),
  ]);
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

  return (
    <div className="space-y-8">
      <div>
        <BackToDashboardLink />
      </div>

      <AdminPageHeader
        eyebrow="Posts"
        title="Create new post"
        action={
          <Link href="/admin/posts" className={adminSecondaryButtonClass}>
            View posts
          </Link>
        }
      />

      <AdminPanel>
        <AdminPostForm
          action={createPost}
          categories={categories}
          series={series}
          showUnfiltered={siteFeatures.unfilteredEnabled}
          mode="create"
        />
      </AdminPanel>
    </div>
  );
}
