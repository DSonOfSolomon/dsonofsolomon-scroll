CREATE TABLE IF NOT EXISTS "NotificationDelivery" (
  "id" TEXT NOT NULL,
  "channel" TEXT NOT NULL DEFAULT 'browser_push',
  "status" TEXT NOT NULL,
  "reason" TEXT,
  "endpoint" TEXT,
  "statusCode" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "creatorId" TEXT NOT NULL,
  "postId" TEXT,
  "followerId" TEXT,

  CONSTRAINT "NotificationDelivery_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "NotificationDelivery_creatorId_createdAt_idx" ON "NotificationDelivery"("creatorId", "createdAt");
CREATE INDEX IF NOT EXISTS "NotificationDelivery_postId_createdAt_idx" ON "NotificationDelivery"("postId", "createdAt");
CREATE INDEX IF NOT EXISTS "NotificationDelivery_followerId_createdAt_idx" ON "NotificationDelivery"("followerId", "createdAt");
CREATE INDEX IF NOT EXISTS "NotificationDelivery_creatorId_status_idx" ON "NotificationDelivery"("creatorId", "status");

ALTER TABLE "NotificationDelivery"
ADD CONSTRAINT "NotificationDelivery_creatorId_fkey"
FOREIGN KEY ("creatorId") REFERENCES "Creator"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NotificationDelivery"
ADD CONSTRAINT "NotificationDelivery_postId_fkey"
FOREIGN KEY ("postId") REFERENCES "Post"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "NotificationDelivery"
ADD CONSTRAINT "NotificationDelivery_followerId_fkey"
FOREIGN KEY ("followerId") REFERENCES "Follower"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
