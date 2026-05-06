-- CreateTable
CREATE TABLE "leagues" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "division" TEXT,
    "tournament_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leagues_pkey" PRIMARY KEY ("id")
);

-- AlterTable: add league_id to matches (nullable for backward compat)
ALTER TABLE "matches" ADD COLUMN "league_id" TEXT;

-- AddForeignKey: leagues -> tournaments
ALTER TABLE "leagues" ADD CONSTRAINT "leagues_tournament_id_fkey"
    FOREIGN KEY ("tournament_id")
    REFERENCES "tournaments"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: matches -> leagues
ALTER TABLE "matches" ADD CONSTRAINT "matches_league_id_fkey"
    FOREIGN KEY ("league_id")
    REFERENCES "leagues"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
