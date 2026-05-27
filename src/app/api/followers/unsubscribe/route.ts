import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPrimaryCreator } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  const limited = await enforceRateLimit(request, {
    prefix: "followers-unsubscribe",
    limit: 10,
    window: "10 m",
  });

  if (limited) {
    return limited;
  }

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

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/followers");

  return NextResponse.json({ ok: true });
}
