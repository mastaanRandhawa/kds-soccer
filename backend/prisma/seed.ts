import { PrismaClient, MatchRound, MatchStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── Date helpers (Pacific time UTC-7) ───────────────────────────────────────
const sat = (hh: number, mm = 0) =>
  new Date(`2026-05-16T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00-07:00`);
const sun = (hh: number, mm = 0) =>
  new Date(`2026-05-17T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00-07:00`);

async function main() {
  console.log("🗑️  Resetting database …");
  await prisma.match.deleteMany();
  await prisma.group.deleteMany();
  await prisma.league.deleteMany();
  await prisma.team.deleteMany();
  await prisma.media.deleteMany();
  await prisma.tournament.deleteMany();
  console.log("✅  Tables cleared");

  // ─── Admin user ──────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", passwordHash, role: "ADMIN" },
  });
  console.log("👤  Admin  admin / admin123");

  // ─── Tournament ──────────────────────────────────────────────────────────
  const tournament = await prisma.tournament.create({
    data: {
      id: "kds-2026",
      name: "KDS Soccer Championship 2026",
      description: "Annual KDS soccer tournament — Mens' Div 1, Div 2, and Over 52.",
      startDate: new Date("2026-05-16"),
      endDate: new Date("2026-05-17"),
      isActive: true,
    },
  });

  // ─── Leagues ─────────────────────────────────────────────────────────────
  const [lOver52, lDiv1, lDiv2] = await Promise.all([
    prisma.league.create({
      data: {
        name: "Mens' Over 52",
        division: "Over 52",
        notes: "35 Min Halves. Shootout Games #1, #2 if needed. Finals: 2×7.5 min OT then shootout.",
        sortOrder: 0,
        tournamentId: tournament.id,
      },
    }),
    prisma.league.create({
      data: {
        name: "Mens' 1",
        division: "Div 1",
        notes: "35 Min Halves. Shootout Games #6, 9, 12, 15, 16, 19 & 20 if needed. Finals: 2×7.5 min OT then shootout.",
        sortOrder: 1,
        tournamentId: tournament.id,
      },
    }),
    prisma.league.create({
      data: {
        name: "Mens' 2",
        division: "Div 2",
        notes: "35 Min Halves. Shootout Games #22, 25, 28, 29, 32, 35 & 36 if needed. Finals: 2×7.5 min OT then shootout.",
        sortOrder: 2,
        tournamentId: tournament.id,
      },
    }),
  ]);
  console.log("📋  Leagues created");

  // ─── Teams ───────────────────────────────────────────────────────────────
  const teamDefs = [
    // Over 52
    { key: "sher-e-punjab",  name: "Sher-E-Punjab" },
    { key: "van-united",     name: "Van United" },
    { key: "vancouver-sc",   name: "Vancouver Soccer Club" },
    { key: "india-nations",  name: "India Nations" },
    // Div 1 Group A
    { key: "temple",         name: "Temple United" },
    { key: "bct-hurricanes", name: "BCT Hurricanes" },
    { key: "van-selam",      name: "Van-Selam FC" },
    // Div 1 Group B
    { key: "bct-supra",      name: "BCT Supra" },
    { key: "ethio",          name: "Ethio FC" },
    { key: "vancity-pro",    name: "Vancity Pro" },
    // Div 1 Group C
    { key: "khalsa",         name: "Khalsa" },
    { key: "bct-punjab-prem", name: "BCT Punjab Prem" },
    { key: "akal",           name: "Akal United" },
    // Div 1 Group D
    { key: "ares",           name: "Ares AFA" },
    { key: "bc-tigers",      name: "BC Tigers" },
    { key: "abbotsford",     name: "Abbotsford United" },
    { key: "coastal",        name: "Coastal FC" },
    // Div 2 Group A (new teams)
    { key: "richmond",       name: "Richmond Unicorns" },
    // Div 2 Group B (new teams)
    { key: "bct-punjab-u19", name: "BCT Punjab U-19" },
    { key: "gvu-punjab",     name: "GVU Punjab" },
    // Div 2 Group C (new teams)
    { key: "dufc",           name: "DUFC" },
    { key: "rho-fc",         name: "RHO FC" },
    { key: "sfc-royals",     name: "SFC Royals" },
    { key: "bct-punjab",     name: "BCT Punjab" },
    // Div 2 Group D (new teams)
    { key: "khalsa-sa",      name: "Khalsa Sporting Academy" },
    { key: "sfc-elite",      name: "SFC Elite" },
    { key: "gvu-phoenix",    name: "GVU Pheonix" },
  ] as const;

  type TeamKey = (typeof teamDefs)[number]["key"];
  const t: Record<TeamKey, { id: string }> = {} as Record<TeamKey, { id: string }>;

  for (const def of teamDefs) {
    t[def.key] = await prisma.team.create({ data: { name: def.name } });
  }
  console.log(`⚽  Created ${teamDefs.length} teams`);

  // ─── Groups ──────────────────────────────────────────────────────────────
  // Over 52 has no named groups — pool play handled at league level (no group)
  const [g1A, g1B, g1C, g1D, g2A, g2B, g2C, g2D] = await Promise.all([
    prisma.group.create({ data: { leagueId: lDiv1.id, name: "Group A", sortOrder: 0 } }),
    prisma.group.create({ data: { leagueId: lDiv1.id, name: "Group B", sortOrder: 1 } }),
    prisma.group.create({ data: { leagueId: lDiv1.id, name: "Group C", sortOrder: 2 } }),
    prisma.group.create({ data: { leagueId: lDiv1.id, name: "Group D", sortOrder: 3 } }),
    prisma.group.create({ data: { leagueId: lDiv2.id, name: "Group A", sortOrder: 0 } }),
    prisma.group.create({ data: { leagueId: lDiv2.id, name: "Group B", sortOrder: 1 } }),
    prisma.group.create({ data: { leagueId: lDiv2.id, name: "Group C", sortOrder: 2 } }),
    prisma.group.create({ data: { leagueId: lDiv2.id, name: "Group D", sortOrder: 3 } }),
  ]);
  console.log("🗂️   Groups created");

  // ─── Matches — full CSV schedule (all 37 games) ───────────────────────────
  // Placeholder-only matches have null team IDs; homePlaceholder/awayPlaceholder
  // carry the display text ("Loser of 6", "Winner of 6", etc.).

  type MatchSeed = {
    gameNumber: number;
    leagueId: string;
    groupId?: string;
    round: MatchRound;
    status: MatchStatus;
    score1?: number;
    score2?: number;
    matchDate: Date;
    field: string;
    team1Id?: string;
    team2Id?: string;
    homePlaceholder?: string;
    awayPlaceholder?: string;
  };

  const matches: MatchSeed[] = [
    // ═══════════════════════════════════════════════════════
    //  MENS' OVER 52  ·  Memorial Pond
    // ═══════════════════════════════════════════════════════
    { gameNumber:  1, leagueId: lOver52.id, round: "GROUP_STAGE", status: "COMPLETED", score1: 2, score2: 1, matchDate: sat(11,  0), field: "Memorial Pond",  team1Id: t["sher-e-punjab"].id,  team2Id: t["van-united"].id },
    { gameNumber:  2, leagueId: lOver52.id, round: "GROUP_STAGE", status: "COMPLETED", score1: 0, score2: 3, matchDate: sat(12, 30), field: "Memorial Pond",  team1Id: t["vancouver-sc"].id,   team2Id: t["india-nations"].id },
    { gameNumber:  3, leagueId: lOver52.id, round: "GROUP_STAGE", status: "SCHEDULED", matchDate: sat(14, 30), field: "Memorial Pond",  homePlaceholder: "Loser of Game 1",   awayPlaceholder: "Winner of Game 2" },
    { gameNumber:  4, leagueId: lOver52.id, round: "GROUP_STAGE", status: "SCHEDULED", matchDate: sat(16,  0), field: "Memorial Pond",  homePlaceholder: "Winner of Game 1",  awayPlaceholder: "Loser of Game 2" },
    { gameNumber:  5, leagueId: lOver52.id, round: "FINAL",       status: "SCHEDULED", matchDate: sun(12, 30), field: "Memorial Pond",  homePlaceholder: "Winner",            awayPlaceholder: "Winner" },

    // ═══════════════════════════════════════════════════════
    //  MENS' 1  ·  Group A  (Memorial Turf)
    // ═══════════════════════════════════════════════════════
    { gameNumber:  6, leagueId: lDiv1.id, groupId: g1A.id, round: "GROUP_STAGE", status: "COMPLETED", score1: 3, score2: 1, matchDate: sat( 9,  0), field: "Memorial Turf",    team1Id: t["bct-hurricanes"].id, team2Id: t["van-selam"].id },
    { gameNumber:  7, leagueId: lDiv1.id, groupId: g1A.id, round: "GROUP_STAGE", status: "SCHEDULED", matchDate: sat(12, 30), field: "Memorial Turf",    homePlaceholder: "Loser of Game 6",   team2Id: t["temple"].id },
    { gameNumber:  8, leagueId: lDiv1.id, groupId: g1A.id, round: "GROUP_STAGE", status: "SCHEDULED", matchDate: sat(16,  0), field: "Memorial Turf",    homePlaceholder: "Winner of Game 6",  team2Id: t["temple"].id },

    // ─── Group B  (Memorial Turf)
    { gameNumber:  9, leagueId: lDiv1.id, groupId: g1B.id, round: "GROUP_STAGE", status: "COMPLETED", score1: 1, score2: 1, matchDate: sat(10, 20), field: "Memorial Turf",    team1Id: t["vancity-pro"].id,    team2Id: t["ethio"].id },
    { gameNumber: 10, leagueId: lDiv1.id, groupId: g1B.id, round: "GROUP_STAGE", status: "SCHEDULED", matchDate: sat(14,  0), field: "Memorial Turf",    homePlaceholder: "Loser of Game 9",   team2Id: t["bct-supra"].id },
    { gameNumber: 11, leagueId: lDiv1.id, groupId: g1B.id, round: "GROUP_STAGE", status: "SCHEDULED", matchDate: sat(17, 30), field: "Memorial Turf",    homePlaceholder: "Winner of Game 9",  team2Id: t["bct-supra"].id },

    // ─── Group C  (King George Turf)
    { gameNumber: 12, leagueId: lDiv1.id, groupId: g1C.id, round: "GROUP_STAGE", status: "COMPLETED", score1: 2, score2: 0, matchDate: sat(10, 20), field: "King George Turf", team1Id: t["bct-punjab-prem"].id, team2Id: t["akal"].id },
    { gameNumber: 13, leagueId: lDiv1.id, groupId: g1C.id, round: "GROUP_STAGE", status: "SCHEDULED", matchDate: sat(14,  0), field: "King George Turf", homePlaceholder: "Loser of Game 12",  team2Id: t["khalsa"].id },
    { gameNumber: 14, leagueId: lDiv1.id, groupId: g1C.id, round: "GROUP_STAGE", status: "SCHEDULED", matchDate: sat(17, 30), field: "King George Turf", homePlaceholder: "Winner of Game 12", team2Id: t["khalsa"].id },

    // ─── Group D
    { gameNumber: 15, leagueId: lDiv1.id, groupId: g1D.id, round: "GROUP_STAGE", status: "COMPLETED", score1: 2, score2: 2, matchDate: sat( 9,  0), field: "King George Turf", team1Id: t["ares"].id,       team2Id: t["bc-tigers"].id },
    { gameNumber: 16, leagueId: lDiv1.id, groupId: g1D.id, round: "GROUP_STAGE", status: "COMPLETED", score1: 1, score2: 0, matchDate: sat( 9,  0), field: "McNair",            team1Id: t["abbotsford"].id, team2Id: t["coastal"].id },
    { gameNumber: 17, leagueId: lDiv1.id, groupId: g1D.id, round: "GROUP_STAGE", status: "SCHEDULED", matchDate: sat(12, 30), field: "McNair",            homePlaceholder: "Loser of Game 15",  awayPlaceholder: "Winner of Game 16" },
    { gameNumber: 18, leagueId: lDiv1.id, groupId: g1D.id, round: "GROUP_STAGE", status: "SCHEDULED", matchDate: sat(12, 30), field: "King George Turf",  homePlaceholder: "Winner of Game 15", awayPlaceholder: "Loser of Game 16" },

    // ─── Knockout: Mens' 1 Semi Finals
    { gameNumber: 19, leagueId: lDiv1.id, round: "SEMIFINAL", status: "SCHEDULED", matchDate: sun(12,  0), field: "Memorial Turf", homePlaceholder: "Winner Group A", awayPlaceholder: "Winner Group B" },
    { gameNumber: 20, leagueId: lDiv1.id, round: "SEMIFINAL", status: "SCHEDULED", matchDate: sun(13, 30), field: "Memorial Turf", homePlaceholder: "Winner Group C", awayPlaceholder: "Winner Group D" },

    // ─── Knockout: Mens' 1 Final
    { gameNumber: 21, leagueId: lDiv1.id, round: "FINAL", status: "SCHEDULED", matchDate: sun(17,  0), field: "Memorial Turf", homePlaceholder: "Winner Game 19", awayPlaceholder: "Winner Game 20" },

    // ═══════════════════════════════════════════════════════
    //  MENS' 2  ·  Group A  (Moberly Upper)
    // ═══════════════════════════════════════════════════════
    { gameNumber: 22, leagueId: lDiv2.id, groupId: g2A.id, round: "GROUP_STAGE", status: "COMPLETED", score1: 1, score2: 2, matchDate: sat(10, 20), field: "Moberly Upper", team1Id: t["akal"].id,       team2Id: t["vancity-pro"].id },
    { gameNumber: 23, leagueId: lDiv2.id, groupId: g2A.id, round: "GROUP_STAGE", status: "SCHEDULED", matchDate: sat(14,  0), field: "Moberly Upper", homePlaceholder: "Loser of Game 22",  team2Id: t["richmond"].id },
    { gameNumber: 24, leagueId: lDiv2.id, groupId: g2A.id, round: "GROUP_STAGE", status: "SCHEDULED", matchDate: sat(17, 30), field: "Moberly Upper", homePlaceholder: "Winner of Game 22", team2Id: t["richmond"].id },

    // ─── Group B  (Moberly Lower)
    { gameNumber: 25, leagueId: lDiv2.id, groupId: g2B.id, round: "GROUP_STAGE", status: "COMPLETED", score1: 2, score2: 0, matchDate: sat(10, 20), field: "Moberly Lower", team1Id: t["temple"].id,         team2Id: t["bct-punjab-u19"].id },
    { gameNumber: 26, leagueId: lDiv2.id, groupId: g2B.id, round: "GROUP_STAGE", status: "SCHEDULED", matchDate: sat(14,  0), field: "Moberly Lower", homePlaceholder: "Loser of Game 25",  team2Id: t["gvu-punjab"].id },
    { gameNumber: 27, leagueId: lDiv2.id, groupId: g2B.id, round: "GROUP_STAGE", status: "SCHEDULED", matchDate: sat(17, 30), field: "Moberly Lower", homePlaceholder: "Winner of Game 25", team2Id: t["gvu-punjab"].id },

    // ─── Group C
    { gameNumber: 28, leagueId: lDiv2.id, groupId: g2C.id, round: "GROUP_STAGE", status: "COMPLETED", score1: 0, score2: 0, matchDate: sat( 9,  0), field: "Moberly Upper", team1Id: t["dufc"].id,      team2Id: t["rho-fc"].id },
    { gameNumber: 29, leagueId: lDiv2.id, groupId: g2C.id, round: "GROUP_STAGE", status: "COMPLETED", score1: 0, score2: 2, matchDate: sat( 9,  0), field: "Moberly Lower", team1Id: t["sfc-royals"].id, team2Id: t["bct-punjab"].id },
    { gameNumber: 30, leagueId: lDiv2.id, groupId: g2C.id, round: "GROUP_STAGE", status: "SCHEDULED", matchDate: sat(12, 30), field: "Moberly Upper", homePlaceholder: "Loser of Game 28",  awayPlaceholder: "Winner of Game 29" },
    { gameNumber: 31, leagueId: lDiv2.id, groupId: g2C.id, round: "GROUP_STAGE", status: "SCHEDULED", matchDate: sat(12, 30), field: "Moberly Lower", homePlaceholder: "Winner of Game 28", awayPlaceholder: "Loser of Game 29" },

    // ─── Group D  (McNair)
    { gameNumber: 32, leagueId: lDiv2.id, groupId: g2D.id, round: "GROUP_STAGE", status: "COMPLETED", score1: 1, score2: 3, matchDate: sat(10, 20), field: "McNair", team1Id: t["gvu-phoenix"].id, team2Id: t["sfc-elite"].id },
    { gameNumber: 33, leagueId: lDiv2.id, groupId: g2D.id, round: "GROUP_STAGE", status: "SCHEDULED", matchDate: sat(14,  0), field: "McNair", homePlaceholder: "Loser of Game 32",  team2Id: t["khalsa-sa"].id },
    { gameNumber: 34, leagueId: lDiv2.id, groupId: g2D.id, round: "GROUP_STAGE", status: "SCHEDULED", matchDate: sat(17, 30), field: "McNair", homePlaceholder: "Winner of Game 32", team2Id: t["khalsa-sa"].id },

    // ─── Knockout: Mens' 2 Semi Finals
    { gameNumber: 35, leagueId: lDiv2.id, round: "SEMIFINAL", status: "SCHEDULED", matchDate: sun( 9,  0), field: "Memorial Turf", homePlaceholder: "Winner Group A", awayPlaceholder: "Winner Group B" },
    { gameNumber: 36, leagueId: lDiv2.id, round: "SEMIFINAL", status: "SCHEDULED", matchDate: sun(10, 30), field: "Memorial Turf", homePlaceholder: "Winner Group C", awayPlaceholder: "Winner Group D" },

    // ─── Knockout: Mens' 2 Final
    { gameNumber: 37, leagueId: lDiv2.id, round: "FINAL", status: "SCHEDULED", matchDate: sun(15,  0), field: "Memorial Turf", homePlaceholder: "Winner Game 35", awayPlaceholder: "Winner Game 36" },
  ];

  for (const m of matches) {
    await prisma.match.create({
      data: {
        gameNumber:      m.gameNumber,
        leagueId:        m.leagueId,
        groupId:         m.groupId ?? null,
        round:           m.round,
        status:          m.status,
        score1:          m.score1 ?? 0,
        score2:          m.score2 ?? 0,
        matchDate:       m.matchDate,
        field:           m.field,
        team1Id:         m.team1Id ?? null,
        team2Id:         m.team2Id ?? null,
        homePlaceholder: m.homePlaceholder ?? null,
        awayPlaceholder: m.awayPlaceholder ?? null,
      },
    });
  }
  console.log(`📅  Created ${matches.length} matches`);

  // ─── Media ───────────────────────────────────────────────────────────────
  await prisma.media.createMany({
    data: [
      { imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800", description: "Stadium during championship match", category: "stadium" },
      { imageUrl: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800",    description: "Team celebration after winning",     category: "celebration" },
      { imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800", description: "Soccer ball on the field",            category: "action" },
      { imageUrl: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800", description: "Fans cheering in the stands",         category: "fans" },
    ],
  });

  console.log("\n✅  Seed complete!");
  console.log("   Tournament : KDS Soccer Championship 2026");
  console.log("   Leagues    : Mens' Over 52 · Mens' 1 (Div 1) · Mens' 2 (Div 2)");
  console.log(`   Teams      : ${teamDefs.length}`);
  console.log("   Groups     : 8 (4 per division)");
  console.log(`   Matches    : ${matches.length} (all 37 from CSV)`);
  console.log("   Admin      : admin / admin123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
