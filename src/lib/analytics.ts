import { prisma } from "@/lib/prisma";

export type SubscriberAnalyticsType =
  | "subscriber_created"
  | "subscriber_updated"
  | "subscriber_deleted"
  | "premium_signup";

export async function recordSubscriberAnalyticsEvent({
  creatorId,
  subscriberId,
  email,
  tier,
  type,
}: {
  creatorId: string;
  subscriberId?: string | null;
  email?: string | null;
  tier?: string | null;
  type: SubscriberAnalyticsType;
}) {
  if (!prisma.subscriberAnalyticsEvent) {
    return;
  }

  try {
    await prisma.subscriberAnalyticsEvent.create({
      data: {
        creatorId,
        subscriberId,
        email,
        tier,
        type,
      },
    });
  } catch (error) {
    console.error("Subscriber analytics event failed", error);
  }
}
