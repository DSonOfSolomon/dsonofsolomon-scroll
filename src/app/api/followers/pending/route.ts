import { NextRequest, NextResponse } from "next/server";
import { getPrimaryCreator } from "@/lib/admin";
import { getNotificationBody } from "@/lib/followers";
import { prisma } from "@/lib/prisma";

type PendingRequestBody = {
  endpoint?: string;
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

  if (!endpoint.startsWith("test://")) {
    return NextResponse.json({ pending: false });
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
      title: "New writing just dropped",
      body: getNotificationBody(pendingPost),
      url: `/writings/${pendingPost.slug}`,
      publishedAt: pendingPost.publishedAt?.toISOString() ?? null,
    },
  });
}
