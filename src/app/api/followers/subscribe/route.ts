import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPrimaryCreator } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rateLimit";

type PushSubscriptionPayload = {
  endpoint: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

export async function POST(request: NextRequest) {
  const limited = await enforceRateLimit(request, {
    prefix: "followers-subscribe",
    limit: 10,
    window: "10 m",
  });

  if (limited) {
    return limited;
  }

  const creator = await getPrimaryCreator();
  let body: PushSubscriptionPayload;

  try {
    body = (await request.json()) as PushSubscriptionPayload;
  } catch {
    return NextResponse.json({ error: "Invalid follow payload." }, { status: 400 });
  }

  const endpoint = body.endpoint?.trim();
  const p256dh = body.keys?.p256dh?.trim();
  const auth = body.keys?.auth?.trim();

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "Invalid follow payload." }, { status: 400 });
  }

  const follower = await prisma.follower.upsert({
    where: {
      creatorId_endpoint: {
        creatorId: creator.id,
        endpoint,
      },
    },
    update: {
      p256dh,
      auth,
      status: "active",
      userAgent: request.headers.get("user-agent"),
    },
    create: {
      endpoint,
      p256dh,
      auth,
      status: "active",
      userAgent: request.headers.get("user-agent"),
      creatorId: creator.id,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/followers");

  return NextResponse.json({
    ok: true,
    follower: {
      id: follower.id,
      status: follower.status,
    },
  });
}
