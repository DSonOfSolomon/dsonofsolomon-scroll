DROP INDEX IF EXISTS "Follower_endpoint_key";

CREATE UNIQUE INDEX "Follower_creatorId_endpoint_key" ON "Follower"("creatorId", "endpoint");
