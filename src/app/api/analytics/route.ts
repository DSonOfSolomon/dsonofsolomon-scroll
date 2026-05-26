import { NextRequest, NextResponse } from "next/server";
import { getPrimaryCreator } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rateLimit";

type AnalyticsPayload = {
  type?: string;
  path?: string;
  referrer?: string;
  sessionId?: string;
  postId?: string;
  universe?: string;
  progress?: number;
  secondsSpent?: number;
  completed?: boolean;
};

function cleanString(value: unknown, maxLength = 500) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized.slice(0, maxLength) : null;
}

function cleanNumber(value: unknown, fallback = 0) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, Math.floor(value));
}

function analyticsDelegatesAvailable() {
  return Boolean(prisma.pageView && prisma.postView && prisma.readingSession);
}

export async function POST(request: NextRequest) {
  const limited = await enforceRateLimit(request, {
    prefix: "analytics",
    limit: 60,
    window: "1 m",
  });

  if (limited) {
    return limited;
  }

  let payload: AnalyticsPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const type = cleanString(payload.type, 80);
  const path = cleanString(payload.path, 500);
  const sessionId = cleanString(payload.sessionId, 120);

  if (!type || !path || path.startsWith("/admin") || path.startsWith("/api")) {
    return NextResponse.json({ ok: true });
  }

  if (!analyticsDelegatesAvailable()) {
    return NextResponse.json({ ok: true });
  }

  const creator = await getPrimaryCreator();
  const referrer = cleanString(payload.referrer, 500);
  const userAgent = cleanString(request.headers.get("user-agent"), 500);

  if (type === "page_view") {
    await prisma.pageView.create({
      data: {
        creatorId: creator.id,
        path,
        referrer,
        sessionId,
        userAgent,
      },
    });

    return NextResponse.json({ ok: true });
  }

  const postId = cleanString(payload.postId, 120);

  if (!postId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      creatorId: creator.id,
      status: "published",
    },
    select: {
      id: true,
      universe: true,
    },
  });

  if (!post) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  if (type === "post_view") {
    await prisma.postView.create({
      data: {
        creatorId: creator.id,
        postId: post.id,
        path,
        referrer,
        sessionId,
        userAgent,
        universe: cleanString(payload.universe, 80) ?? post.universe,
      },
    });

    return NextResponse.json({ ok: true });
  }

  if (type === "reading_progress") {
    if (!sessionId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const progress = Math.min(100, cleanNumber(payload.progress));
    const secondsSpent = Math.min(24 * 60 * 60, cleanNumber(payload.secondsSpent));
    const completed = Boolean(payload.completed) || progress >= 90;

    await prisma.readingSession.upsert({
      where: {
        postId_sessionId: {
          postId: post.id,
          sessionId,
        },
      },
      update: {
        path,
        maxProgress: {
          set: progress,
        },
        secondsSpent: {
          set: secondsSpent,
        },
        completed,
        lastRecordedAt: new Date(),
      },
      create: {
        creatorId: creator.id,
        postId: post.id,
        path,
        sessionId,
        maxProgress: progress,
        secondsSpent,
        completed,
      },
    });

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
