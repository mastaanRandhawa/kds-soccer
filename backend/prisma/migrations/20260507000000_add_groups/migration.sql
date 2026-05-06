-- CreateTable: groups
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "league_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey: groups -> leagues (cascade delete groups when league is deleted)
ALTER TABLE "groups" ADD CONSTRAINT "groups_league_id_fkey"
    FOREIGN KEY ("league_id") REFERENCES "leagues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable leagues: add notes and sort_order
ALTER TABLE "leagues" ADD COLUMN "notes" TEXT;
ALTER TABLE "leagues" ADD COLUMN "sort_order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable matches: make team IDs nullable (supports placeholder-only matches)
ALTER TABLE "matches" ALTER COLUMN "team_1_id" DROP NOT NULL;
ALTER TABLE "matches" ALTER COLUMN "team_2_id" DROP NOT NULL;

-- AlterTable matches: add new schedule fields
ALTER TABLE "matches" ADD COLUMN "game_number" INTEGER;
ALTER TABLE "matches" ADD COLUMN "field" TEXT;
ALTER TABLE "matches" ADD COLUMN "group_id" TEXT;
ALTER TABLE "matches" ADD COLUMN "home_placeholder" TEXT;
ALTER TABLE "matches" ADD COLUMN "away_placeholder" TEXT;
ALTER TABLE "matches" ADD COLUMN "notes" TEXT;

-- AddForeignKey: matches -> groups
ALTER TABLE "matches" ADD CONSTRAINT "matches_group_id_fkey"
    FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
