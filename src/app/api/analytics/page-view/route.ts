import { NextResponse } from "next/server";
import { getPrimaryCreator } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { path, visitorId, sessionId } = (await request.json()) as {
      path?: string;
      visitorId?: string;
      sessionId?: string;
    };

    if (!path || !visitorId || !sessionId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const creator = await getPrimaryCreator();
    const pathname = path.split("?")[0];
    const slugMatch = pathname.match(/^\/writings\/([^/]+)$/);

    let postId: string | null = null;

    if (slugMatch?.[1]) {
      const post = await prisma.post.findFirst({
        where: {
          creatorId: creator.id,
          slug: decodeURIComponent(slugMatch[1]),
          status: "published",
          universe: "public",
        },
        select: {
          id: true,
        },
      });

      postId = post?.id ?? null;
    }

    await prisma.pageView.create({
      data: {
        path,
        visitorId,
        sessionId,
        creatorId: creator.id,
        postId,
        referrer: request.headers.get("referer"),
        userAgent: request.headers.get("user-agent"),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
