import { NextResponse } from "next/server";
import { getPrimaryCreator } from "@/lib/admin";
import { READING_MILESTONES } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { postId, milestone, visitorId, sessionId } = (await request.json()) as {
      postId?: string;
      milestone?: number;
      visitorId?: string;
      sessionId?: string;
    };

    if (
      !postId ||
      !visitorId ||
      !sessionId ||
      typeof milestone !== "number" ||
      !READING_MILESTONES.includes(milestone as (typeof READING_MILESTONES)[number])
    ) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const creator = await getPrimaryCreator();
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        creatorId: creator.id,
        status: "published",
        universe: "public",
      },
      select: {
        id: true,
      },
    });

    if (!post) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    await prisma.readingEvent.upsert({
      where: {
        postId_sessionId_milestone: {
          postId,
          sessionId,
          milestone,
        },
      },
      update: {
        visitorId,
      },
      create: {
        postId,
        milestone,
        visitorId,
        sessionId,
        creatorId: creator.id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
