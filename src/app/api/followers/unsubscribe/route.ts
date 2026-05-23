import { NextRequest, NextResponse } from "next/server";
import { getPrimaryCreator } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const creator = await getPrimaryCreator();
  let body: { endpoint?: string };

  try {
    body = (await request.json()) as { endpoint?: string };
  } catch {
    return NextResponse.json({ error: "Invalid follow payload." }, { status: 400 });
  }

  const endpoint = body.endpoint?.trim();

  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint is required." }, { status: 400 });
  }

  await prisma.follower.updateMany({
    where: {
      endpoint,
      creatorId: creator.id,
    },
    data: {
      status: "inactive",
    },
  });

  return NextResponse.json({ ok: true });
}
