import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type AckRequestBody = {
  endpoint?: string;
  postId?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as AckRequestBody;
  const endpoint = body.endpoint?.trim();
  const postId = body.postId?.trim();

  if (!endpoint || !postId) {
    return NextResponse.json(
      { error: "Endpoint and postId are required." },
      { status: 400 },
    );
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      publishedAt: true,
    },
  });

  await prisma.follower.updateMany({
    where: {
      endpoint,
      status: "active",
    },
    data: {
      lastNotifiedAt: post?.publishedAt ?? new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
