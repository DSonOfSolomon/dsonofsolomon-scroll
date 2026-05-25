-- CreateTable
CREATE TABLE "Series" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "Series_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Post" ADD COLUMN "seriesId" TEXT;
ALTER TABLE "Post" ADD COLUMN "episodeNumber" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Series_creatorId_slug_key" ON "Series"("creatorId", "slug");

-- CreateIndex
CREATE INDEX "Series_creatorId_createdAt_idx" ON "Series"("creatorId", "createdAt");

-- CreateIndex
CREATE INDEX "Post_seriesId_episodeNumber_idx" ON "Post"("seriesId", "episodeNumber");

-- AddForeignKey
ALTER TABLE "Series" ADD CONSTRAINT "Series_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE SET NULL ON UPDATE CASCADE;
