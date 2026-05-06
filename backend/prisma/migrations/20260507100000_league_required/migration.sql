-- Make league_id NOT NULL on matches (every match must belong to a league)
-- All existing rows already have a league_id from the seed, so this is safe.
ALTER TABLE "matches" ALTER COLUMN "league_id" SET NOT NULL;

-- Replace the SET NULL foreign key with CASCADE:
-- deleting a league now cascades and deletes all its matches.
ALTER TABLE "matches" DROP CONSTRAINT IF EXISTS "matches_league_id_fkey";
ALTER TABLE "matches" ADD CONSTRAINT "matches_league_id_fkey"
    FOREIGN KEY ("league_id") REFERENCES "leagues"("id") ON DELETE CASCADE ON UPDATE CASCADE;
