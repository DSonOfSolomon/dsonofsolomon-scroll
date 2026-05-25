import { prisma } from "@/lib/prisma";

type PublishedPostForNotification = {
  id: string;
  title: string;
  slug: string;
  chapterLabel: string | null;
  creatorId: string;
  universe: string;
  status: string;
  seriesId?: string | null;
  episodeNumber?: number | null;
};

function getChapterLabel(post: PublishedPostForNotification) {
  return post.chapterLabel?.trim() || "New chapter";
}

function getEpisodeLabel(post: PublishedPostForNotification) {
  return post.episodeNumber ? `Episode ${post.episodeNumber}` : "New episode";
}

export async function createInAppNotificationsForPublishedPost(
  post: PublishedPostForNotification,
) {
  if (
    post.status !== "published" ||
    (post.universe !== "public" && post.universe !== "series")
  ) {
    return { created: 0, skipped: true };
  }

  const series =
    post.universe === "series" && post.seriesId
      ? await prisma.series.findUnique({
          where: {
            id: post.seriesId,
          },
          select: {
            title: true,
            slug: true,
          },
        })
      : null;

  if (post.universe === "series" && !series) {
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

  const notification =
    post.universe === "series" && series
      ? {
          type: "series_episode",
          title: `${getEpisodeLabel(post)} of "${series.title}" is out.`,
          body: "D•sonofSolomon just dropped a new episode.",
          href: `/series/${series.slug}/${post.slug}`,
        }
      : {
          type: "public_post",
          title: `${getChapterLabel(post)} of "${post.title}" is out.`,
          body: "D•sonofSolomon just dropped a new chapter.",
          href: `/writings/${post.slug}`,
        };

  const result = await prisma.inAppNotification.createMany({
    data: followers.map((follower) => ({
      creatorId: post.creatorId,
      followerId: follower.id,
      postId: post.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      href: notification.href,
    })),
    skipDuplicates: true,
  });

  return { created: result.count, skipped: false };
}
