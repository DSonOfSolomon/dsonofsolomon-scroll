import webpush from "web-push";
import { prisma } from "@/lib/prisma";

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BD3T-gnMA_C6wPMPSFypmeTw4Xz4g0Ey2PX9B3XzYG2Ye1yxQ7kfN3JJeqnrWpPrTH7GE96CtRwJILfalVYy6yg";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || "mailto:hello@dsonofsolomon.com";

type PublishedPostNotification = {
  id: string;
  title: string;
  slug: string;
  chapterLabel: string | null;
  creatorId: string;
  universe: string;
  status: string;
  publishedAt: Date | null;
};

function configureWebPush() {
  if (!VAPID_PRIVATE_KEY) {
    return false;
  }

  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
  );

  return true;
}

export async function notifyFollowersOfPublishedPost(
  post: PublishedPostNotification,
) {
  if (post.status !== "published" || post.universe !== "public") {
    return;
  }

  if (!configureWebPush()) {
    return;
  }

  const followers = await prisma.follower.findMany({
    where: {
      creatorId: post.creatorId,
      status: "active",
      endpoint: {
        not: {
          startsWith: "test://",
        },
      },
    },
    select: {
      id: true,
      endpoint: true,
      p256dh: true,
      auth: true,
    },
  });

  if (followers.length === 0) {
    return;
  }

  const payload = JSON.stringify({
    title: "New content just dropped",
    body: post.chapterLabel
      ? `${post.chapterLabel} — ${post.title}`
      : post.title,
    url: `/writings/${post.slug}`,
  });

  const publishedAt = post.publishedAt ?? new Date();

  await Promise.all(
    followers.map(async (follower) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: follower.endpoint,
            keys: {
              p256dh: follower.p256dh,
              auth: follower.auth,
            },
          },
          payload,
        );

        await prisma.follower.update({
          where: { id: follower.id },
          data: {
            lastNotifiedAt: publishedAt,
          },
        });
      } catch (error) {
        const statusCode =
          typeof error === "object" &&
          error !== null &&
          "statusCode" in error &&
          typeof error.statusCode === "number"
            ? error.statusCode
            : null;

        if (statusCode === 404 || statusCode === 410) {
          await prisma.follower.update({
            where: { id: follower.id },
            data: {
              status: "inactive",
            },
          });
        }
      }
    }),
  );
}
