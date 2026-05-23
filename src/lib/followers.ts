import { getPrimaryCreator } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function getPrimaryCreatorFollowerWhere(status?: string) {
  const creator = await getPrimaryCreator();

  return {
    creator,
    where: {
      creatorId: creator.id,
      ...(status ? { status } : {}),
    },
  };
}

export function getNotificationBody(post: {
  title: string;
  chapterLabel: string | null;
}) {
  return post.chapterLabel
    ? `${post.chapterLabel} - ${post.title}`
    : post.title;
}

export async function countPrimaryCreatorFollowers(status = "active") {
  const { where } = await getPrimaryCreatorFollowerWhere(status);

  return prisma.follower.count({ where });
}
