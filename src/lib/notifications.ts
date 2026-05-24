import webpush from "web-push";
import type { Prisma } from "@/generated/prisma";
import { getNotificationBody } from "@/lib/followers";
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

export type NotificationDeliverySummary = {
  attempted: number;
  sent: number;
  failed: number;
  skipped: number;
  reason?: string;
};

type BrowserPushFollower = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  creatorId: string;
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
): Promise<NotificationDeliverySummary> {
  if (post.status !== "published" || post.universe !== "public") {
    await prisma.notificationDelivery.create({
      data: {
        creatorId: post.creatorId,
        postId: post.id,
        status: "skipped",
        reason: "Post is not a published public writing.",
      },
    });

    return {
      attempted: 0,
      sent: 0,
      failed: 0,
      skipped: 1,
      reason: "Post is not a published public writing.",
    };
  }

  if (!configureWebPush()) {
    await prisma.notificationDelivery.create({
      data: {
        creatorId: post.creatorId,
        postId: post.id,
        status: "skipped",
        reason: "Missing VAPID private key.",
      },
    });

    return {
      attempted: 0,
      sent: 0,
      failed: 0,
      skipped: 1,
      reason: "Missing VAPID private key.",
    };
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
      creatorId: true,
    },
  });

  if (followers.length === 0) {
    await prisma.notificationDelivery.create({
      data: {
        creatorId: post.creatorId,
        postId: post.id,
        status: "skipped",
        reason: "No active browser push followers.",
      },
    });

    return {
      attempted: 0,
      sent: 0,
      failed: 0,
      skipped: 1,
      reason: "No active browser push followers.",
    };
  }

  const payload = JSON.stringify({
    title: getNotificationBody(post),
    body: "New writing just dropped. Tap to read.",
    url: `/writings/${post.slug}`,
    tag: `post-${post.id}-${Date.now()}`,
    timestamp: Date.now(),
    renotify: true,
    actions: [
      {
        action: "read",
        title: "Read",
      },
    ],
  });

  const publishedAt = post.publishedAt ?? new Date();
  let sent = 0;
  let failed = 0;

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

        sent += 1;

        await prisma.$transaction([
          prisma.follower.update({
            where: { id: follower.id },
            data: {
              lastNotifiedAt: publishedAt,
            },
          }),
          prisma.notificationDelivery.create({
            data: {
              creatorId: follower.creatorId,
              postId: post.id,
              followerId: follower.id,
              endpoint: follower.endpoint,
              status: "sent",
            },
          }),
        ]);
      } catch (error) {
        failed += 1;
        const statusCode =
          typeof error === "object" &&
          error !== null &&
          "statusCode" in error &&
          typeof error.statusCode === "number"
            ? error.statusCode
            : null;
        const reason =
          error instanceof Error ? error.message.slice(0, 500) : "Unknown push error.";

        const updates: Prisma.PrismaPromise<unknown>[] = [
          prisma.notificationDelivery.create({
            data: {
              creatorId: follower.creatorId,
              postId: post.id,
              followerId: follower.id,
              endpoint: follower.endpoint,
              status: "failed",
              statusCode,
              reason,
            },
          }),
        ];

        if (statusCode === 404 || statusCode === 410) {
          updates.push(
            prisma.follower.update({
              where: { id: follower.id },
              data: {
                status: "inactive",
              },
            }),
          );
        }

        await prisma.$transaction(updates);
      }
    }),
  );

  return {
    attempted: followers.length,
    sent,
    failed,
    skipped: 0,
  };
}

export async function sendFollowerTestNotification(
  follower: BrowserPushFollower,
): Promise<NotificationDeliverySummary> {
  if (!configureWebPush()) {
    await prisma.notificationDelivery.create({
      data: {
        creatorId: follower.creatorId,
        followerId: follower.id,
        endpoint: follower.endpoint,
        status: "skipped",
        reason: "Missing VAPID private key.",
      },
    });

    return {
      attempted: 0,
      sent: 0,
      failed: 0,
      skipped: 1,
      reason: "Missing VAPID private key.",
    };
  }

  if (follower.endpoint.startsWith("test://")) {
    await prisma.notificationDelivery.create({
      data: {
        creatorId: follower.creatorId,
        followerId: follower.id,
        endpoint: follower.endpoint,
        status: "skipped",
        reason: "Local test endpoints do not use web push.",
      },
    });

    return {
      attempted: 0,
      sent: 0,
      failed: 0,
      skipped: 1,
      reason: "Local test endpoints do not use web push.",
    };
  }

  const payload = JSON.stringify({
    title: "D•sonofSolomon",
    body: "Your browser notification setup is working.",
    url: "/writings",
    tag: `follower-test-${follower.id}-${Date.now()}`,
    timestamp: Date.now(),
    renotify: true,
    actions: [
      {
        action: "read",
        title: "Read",
      },
    ],
  });

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

    await prisma.notificationDelivery.create({
      data: {
        creatorId: follower.creatorId,
        followerId: follower.id,
        endpoint: follower.endpoint,
        status: "sent",
        reason: "Manual follower test.",
      },
    });

    return {
      attempted: 1,
      sent: 1,
      failed: 0,
      skipped: 0,
    };
  } catch (error) {
    const statusCode =
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      typeof error.statusCode === "number"
        ? error.statusCode
        : null;
    const reason =
      error instanceof Error ? error.message.slice(0, 500) : "Unknown push error.";

    const updates: Prisma.PrismaPromise<unknown>[] = [
      prisma.notificationDelivery.create({
        data: {
          creatorId: follower.creatorId,
          followerId: follower.id,
          endpoint: follower.endpoint,
          status: "failed",
          statusCode,
          reason,
        },
      }),
    ];

    if (statusCode === 404 || statusCode === 410) {
      updates.push(
        prisma.follower.update({
          where: { id: follower.id },
          data: {
            status: "inactive",
          },
        }),
      );
    }

    await prisma.$transaction(updates);

    return {
      attempted: 1,
      sent: 0,
      failed: 1,
      skipped: 0,
      reason,
    };
  }
}
