import { NextRequest, NextResponse } from "next/server";
import { getPrimaryCreator } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

type NotificationRequestBody = {
  endpoint?: string;
  markReadId?: string;
  markAllRead?: boolean;
};

export async function POST(request: NextRequest) {
  const creator = await getPrimaryCreator();
  let body: NotificationRequestBody;

  try {
    body = (await request.json()) as NotificationRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid notification payload." }, { status: 400 });
  }

  const endpoint = body.endpoint?.trim();

  if (!endpoint) {
    return NextResponse.json({
      notifications: [],
      unreadCount: 0,
    });
  }

  const follower = await prisma.follower.findUnique({
    where: {
      creatorId_endpoint: {
        creatorId: creator.id,
        endpoint,
      },
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!follower || follower.status !== "active") {
    return NextResponse.json({
      notifications: [],
      unreadCount: 0,
    });
  }

  if (body.markAllRead) {
    await prisma.inAppNotification.updateMany({
      where: {
        followerId: follower.id,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  } else if (body.markReadId) {
    await prisma.inAppNotification.updateMany({
      where: {
        id: body.markReadId,
        followerId: follower.id,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  const [notifications, unreadCount] = await Promise.all([
    prisma.inAppNotification.findMany({
      where: {
        followerId: follower.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
      select: {
        id: true,
        title: true,
        body: true,
        href: true,
        readAt: true,
        createdAt: true,
      },
    }),
    prisma.inAppNotification.count({
      where: {
        followerId: follower.id,
        readAt: null,
      },
    }),
  ]);

  return NextResponse.json({
    notifications: notifications.map((notification) => ({
      ...notification,
      readAt: notification.readAt?.toISOString() ?? null,
      createdAt: notification.createdAt.toISOString(),
    })),
    unreadCount,
  });
}
