-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "sessionId" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostView" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "sessionId" TEXT,
    "userAgent" TEXT,
    "universe" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "PostView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingSession" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "sessionId" TEXT,
    "maxProgress" INTEGER NOT NULL DEFAULT 0,
    "secondsSpent" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "lastRecordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "ReadingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriberAnalyticsEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tier" TEXT,
    "email" TEXT,
    "subscriberId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "SubscriberAnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageView_creatorId_createdAt_idx" ON "PageView"("creatorId", "createdAt");

-- CreateIndex
CREATE INDEX "PageView_creatorId_path_idx" ON "PageView"("creatorId", "path");

-- CreateIndex
CREATE INDEX "PostView_creatorId_createdAt_idx" ON "PostView"("creatorId", "createdAt");

-- CreateIndex
CREATE INDEX "PostView_postId_createdAt_idx" ON "PostView"("postId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingSession_postId_sessionId_key" ON "ReadingSession"("postId", "sessionId");

-- CreateIndex
CREATE INDEX "ReadingSession_creatorId_createdAt_idx" ON "ReadingSession"("creatorId", "createdAt");

-- CreateIndex
CREATE INDEX "ReadingSession_postId_completed_idx" ON "ReadingSession"("postId", "completed");

-- CreateIndex
CREATE INDEX "SubscriberAnalyticsEvent_creatorId_createdAt_idx" ON "SubscriberAnalyticsEvent"("creatorId", "createdAt");

-- CreateIndex
CREATE INDEX "SubscriberAnalyticsEvent_creatorId_type_idx" ON "SubscriberAnalyticsEvent"("creatorId", "type");

-- CreateIndex
CREATE INDEX "SubscriberAnalyticsEvent_subscriberId_idx" ON "SubscriberAnalyticsEvent"("subscriberId");

-- AddForeignKey
ALTER TABLE "PageView" ADD CONSTRAINT "PageView_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostView" ADD CONSTRAINT "PostView_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostView" ADD CONSTRAINT "PostView_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingSession" ADD CONSTRAINT "ReadingSession_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingSession" ADD CONSTRAINT "ReadingSession_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriberAnalyticsEvent" ADD CONSTRAINT "SubscriberAnalyticsEvent_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriberAnalyticsEvent" ADD CONSTRAINT "SubscriberAnalyticsEvent_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "Subscriber"("id") ON DELETE SET NULL ON UPDATE CASCADE;
