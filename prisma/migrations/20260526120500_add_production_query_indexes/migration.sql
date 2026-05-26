CREATE INDEX "Series_updatedAt_idx" ON "Series"("updatedAt");

CREATE INDEX "Post_creatorId_status_universe_publishedAt_idx" ON "Post"("creatorId", "status", "universe", "publishedAt");
CREATE INDEX "Post_status_universe_publishedAt_idx" ON "Post"("status", "universe", "publishedAt");
CREATE INDEX "Post_status_universe_slug_idx" ON "Post"("status", "universe", "slug");
CREATE INDEX "Post_seriesId_status_universe_episodeNumber_publishedAt_idx" ON "Post"("seriesId", "status", "universe", "episodeNumber", "publishedAt");

CREATE INDEX "Follower_creatorId_status_idx" ON "Follower"("creatorId", "status");
CREATE INDEX "Follower_creatorId_lastNotifiedAt_idx" ON "Follower"("creatorId", "lastNotifiedAt");

CREATE INDEX "InAppNotification_followerId_createdAt_idx" ON "InAppNotification"("followerId", "createdAt");

CREATE INDEX "NotificationDelivery_creatorId_endpoint_status_createdAt_idx" ON "NotificationDelivery"("creatorId", "endpoint", "status", "createdAt");
