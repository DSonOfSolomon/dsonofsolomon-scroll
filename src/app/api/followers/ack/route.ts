import { NextRequest, NextResponse } from "next/server";
import { getPrimaryCreator } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rateLimit";

type AckRequestBody = {
  endpoint?: string;
  postId?: string;
};

export async function POST(request: NextRequest) {
  const limited = await enforceRateLimit(request, {
    prefix: "followers-ack",
    limit: 60,
    window: "1 m",
  });

  if (limited) {
    return limited;
  }

  const creator = await getPrimaryCreator();
  let body: AckRequestBody;

  try {
    body = (await request.json()) as AckRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid follow payload." }, { status: 400 });
  }

  const endpoint = body.endpoint?.trim();
  const postId = body.postId?.trim();

  if (!endpoint || !postId) {
    return NextResponse.json(
      { error: "Endpoint and postId are required." },
      { status: 400 },
    );
  }

  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      creatorId: creator.id,
    },
    select: {
      publishedAt: true,
    },
  });

  await prisma.follower.updateMany({
    where: {
      endpoint,
      creatorId: creator.id,
      status: "active",
    },
    data: {
      lastNotifiedAt: post?.publishedAt ?? new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
