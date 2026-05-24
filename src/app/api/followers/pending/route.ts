import { NextRequest, NextResponse } from "next/server";
import { getPrimaryCreator } from "@/lib/admin";
import { getNotificationBody } from "@/lib/followers";
import { prisma } from "@/lib/prisma";

type PendingRequestBody = {
  endpoint?: string;
  lastSeenDeliveryId?: string;
};

export async function POST(request: NextRequest) {
  const creator = await getPrimaryCreator();
  let body: PendingRequestBody;

  try {
    body = (await request.json()) as PendingRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid follow payload." }, { status: 400 });
  }

  const endpoint = body.endpoint?.trim();

  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint is required." }, { status: 400 });
  }

  const follower = await prisma.follower.findUnique({
    where: {
      creatorId_endpoint: {
        creatorId: creator.id,
        endpoint,
      },
    },
    select: {
      endpoint: true,
      status: true,
      creatorId: true,
      createdAt: true,
      lastNotifiedAt: true,
    },
  });

  if (!follower || follower.status !== "active") {
    return NextResponse.json({ pending: false });
  }

  if (!endpoint.startsWith("test://")) {
    const lastSeenDelivery = body.lastSeenDeliveryId
      ? await prisma.notificationDelivery.findFirst({
          where: {
            id: body.lastSeenDeliveryId,
            creatorId: creator.id,
            endpoint,
          },
          select: {
            createdAt: true,
          },
        })
      : null;

    const recentDelivery = await prisma.notificationDelivery.findFirst({
      where: {
        creatorId: creator.id,
        endpoint,
        status: "sent",
        createdAt: lastSeenDelivery
          ? {
              gt: lastSeenDelivery.createdAt,
            }
          : undefined,
        post: {
          status: "published",
          universe: "public",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
            chapterLabel: true,
          },
        },
      },
    });

    if (!recentDelivery?.post) {
      return NextResponse.json({ pending: false });
    }

    return NextResponse.json({
      pending: true,
      deliveryId: recentDelivery.id,
      notification: {
        postId: recentDelivery.post.id,
        title: getNotificationBody(recentDelivery.post),
        body: "New writing just dropped. Tap to read.",
        url: `/writings/${recentDelivery.post.slug}`,
        tag: `delivery-${recentDelivery.id}`,
        timestamp: recentDelivery.createdAt.getTime(),
        renotify: true,
      },
    });
  }

  const threshold = follower.lastNotifiedAt ?? follower.createdAt;
  const pendingPost = await prisma.post.findFirst({
    where: {
      creatorId: follower.creatorId,
      status: "published",
      universe: "public",
      publishedAt: {
        gt: threshold,
      },
    },
    orderBy: {
      publishedAt: "asc",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      chapterLabel: true,
      publishedAt: true,
    },
  });

  if (!pendingPost) {
    return NextResponse.json({ pending: false });
  }

  return NextResponse.json({
    pending: true,
    notification: {
      postId: pendingPost.id,
      title: getNotificationBody(pendingPost),
      body: "New writing just dropped. Tap to read.",
      url: `/writings/${pendingPost.slug}`,
      tag: `post-${pendingPost.id}-${Date.now()}`,
      timestamp: Date.now(),
      renotify: true,
      publishedAt: pendingPost.publishedAt?.toISOString() ?? null,
    },
  });
}
