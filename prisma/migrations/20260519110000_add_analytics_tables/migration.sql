CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "referrer" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" TEXT NOT NULL,
    "postId" TEXT,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReadingEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "milestone" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "ReadingEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ReadingEvent_postId_sessionId_milestone_key" ON "ReadingEvent"("postId", "sessionId", "milestone");
CREATE INDEX "PageView_creatorId_createdAt_idx" ON "PageView"("creatorId", "createdAt");
CREATE INDEX "PageView_path_createdAt_idx" ON "PageView"("path", "createdAt");
CREATE INDEX "PageView_postId_createdAt_idx" ON "PageView"("postId", "createdAt");
CREATE INDEX "ReadingEvent_creatorId_createdAt_idx" ON "ReadingEvent"("creatorId", "createdAt");
CREATE INDEX "ReadingEvent_postId_createdAt_idx" ON "ReadingEvent"("postId", "createdAt");

ALTER TABLE "PageView" ADD CONSTRAINT "PageView_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PageView" ADD CONSTRAINT "PageView_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReadingEvent" ADD CONSTRAINT "ReadingEvent_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReadingEvent" ADD CONSTRAINT "ReadingEvent_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
