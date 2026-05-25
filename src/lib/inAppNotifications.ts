import { prisma } from "@/lib/prisma";

type PublishedPostForNotification = {
  id: string;
  title: string;
  slug: string;
  chapterLabel: string | null;
  creatorId: string;
  universe: string;
  status: string;
};

function getChapterLabel(post: PublishedPostForNotification) {
  return post.chapterLabel?.trim() || "New chapter";
}

export async function createInAppNotificationsForPublishedPost(
  post: PublishedPostForNotification,
) {
  if (post.status !== "published" || post.universe !== "public") {
    return { created: 0, skipped: true };
  }

  const followers = await prisma.follower.findMany({
    where: {
      creatorId: post.creatorId,
      status: "active",
    },
    select: {
      id: true,
    },
  });

  if (followers.length === 0) {
    return { created: 0, skipped: true };
  }

  const result = await prisma.inAppNotification.createMany({
    data: followers.map((follower) => ({
      creatorId: post.creatorId,
      followerId: follower.id,
      postId: post.id,
      type: "public_post",
      title: `${getChapterLabel(post)} of "${post.title}" is out.`,
      body: "D•sonofSolomon just dropped a new chapter.",
      href: `/writings/${post.slug}`,
    })),
    skipDuplicates: true,
  });

  return { created: result.count, skipped: false };
}
