-- CreateTable
CREATE TABLE "InAppNotification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'public_post',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" TEXT NOT NULL,
    "postId" TEXT,
    "followerId" TEXT NOT NULL,

    CONSTRAINT "InAppNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InAppNotification_followerId_postId_type_key" ON "InAppNotification"("followerId", "postId", "type");

-- CreateIndex
CREATE INDEX "InAppNotification_creatorId_createdAt_idx" ON "InAppNotification"("creatorId", "createdAt");

-- CreateIndex
CREATE INDEX "InAppNotification_followerId_readAt_idx" ON "InAppNotification"("followerId", "readAt");

-- CreateIndex
CREATE INDEX "InAppNotification_postId_createdAt_idx" ON "InAppNotification"("postId", "createdAt");

-- AddForeignKey
ALTER TABLE "InAppNotification" ADD CONSTRAINT "InAppNotification_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InAppNotification" ADD CONSTRAINT "InAppNotification_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InAppNotification" ADD CONSTRAINT "InAppNotification_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "Follower"("id") ON DELETE CASCADE ON UPDATE CASCADE;
