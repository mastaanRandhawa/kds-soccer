import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = Router();

// ─── Public ──────────────────────────────────────────────────────────────────

/** GET /api/leagues  – list all, optionally filtered by ?tournamentId=, supports ?includeGroups=true */
router.get("/", async (req, res) => {
  try {
    const { tournamentId, includeGroups } = req.query;
    const leagues = await prisma.league.findMany({
      where: tournamentId ? { tournamentId: tournamentId as string } : undefined,
      include: {
        tournament: true,
        _count: { select: { matches: true, groups: true } },
        ...(includeGroups === "true"
          ? { groups: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] } }
          : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    res.json(leagues);
  } catch (error) {
    console.error("Get leagues error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** GET /api/leagues/:id */
router.get("/:id", async (req, res) => {
  try {
    const league = await prisma.league.findUnique({
      where: { id: req.params.id },
      include: {
        tournament: true,
        groups: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] },
        matches: {
          include: { team1: true, team2: true, group: true },
          orderBy: [{ gameNumber: "asc" }, { matchDate: "asc" }],
        },
      },
    });
    if (!league) return res.status(404).json({ error: "League not found" });
    res.json(league);
  } catch (error) {
    console.error("Get league error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/leagues/:id/standings
 *
 * Returns an array of standing rows computed from COMPLETED matches in this league.
 * Row: { teamId, teamName, gp, w, d, l, gf, ga, gd, pts }
 */
router.get("/:id/standings", async (req, res) => {
  try {
    const league = await prisma.league.findUnique({
      where: { id: req.params.id },
    });
    if (!league) return res.status(404).json({ error: "League not found" });

    const matches = await prisma.match.findMany({
      where: { leagueId: req.params.id, status: "COMPLETED" },
      include: { team1: true, team2: true },
    });

    const table: Record<
      string,
      {
        teamId: string;
        teamName: string;
        gp: number;
        w: number;
        d: number;
        l: number;
        gf: number;
        ga: number;
      }
    > = {};

    const ensure = (id: string, name: string) => {
      if (!table[id]) table[id] = { teamId: id, teamName: name, gp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 };
    };

    for (const m of matches) {
      // Skip matches where either team is a placeholder (no real team assigned yet)
      if (!m.team1Id || !m.team2Id || !m.team1 || !m.team2) continue;

      ensure(m.team1Id, m.team1.name);
      ensure(m.team2Id, m.team2.name);

      table[m.team1Id].gp++;
      table[m.team2Id].gp++;
      table[m.team1Id].gf += m.score1;
      table[m.team1Id].ga += m.score2;
      table[m.team2Id].gf += m.score2;
      table[m.team2Id].ga += m.score1;

      if (m.score1 > m.score2) {
        table[m.team1Id].w++;
        table[m.team2Id].l++;
      } else if (m.score1 < m.score2) {
        table[m.team2Id].w++;
        table[m.team1Id].l++;
      } else {
        table[m.team1Id].d++;
        table[m.team2Id].d++;
      }
    }

    const standings = Object.values(table)
      .map((r) => ({
        ...r,
        gd: r.gf - r.ga,
        pts: r.w * 3 + r.d,
      }))
      .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.teamName.localeCompare(b.teamName));

    res.json(standings);
  } catch (error) {
    console.error("Get standings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/leagues/:id/bracket
 *
 * Returns knockout matches for this league, organized by round.
 */
router.get("/:id/bracket", async (req, res) => {
  try {
    const league = await prisma.league.findUnique({ where: { id: req.params.id } });
    if (!league) return res.status(404).json({ error: "League not found" });

    const matches = await prisma.match.findMany({
      where: {
        leagueId: req.params.id,
        round: { in: ["ROUND_OF_16", "QUARTERFINAL", "SEMIFINAL", "THIRD_PLACE", "FINAL"] },
      },
      include: { team1: true, team2: true },
      orderBy: { matchDate: "asc" },
    });

    res.json({
      roundOf16: matches.filter((m) => m.round === "ROUND_OF_16"),
      quarterfinals: matches.filter((m) => m.round === "QUARTERFINAL"),
      semifinals: matches.filter((m) => m.round === "SEMIFINAL"),
      thirdPlace: matches.filter((m) => m.round === "THIRD_PLACE"),
      final: matches.filter((m) => m.round === "FINAL"),
    });
  } catch (error) {
    console.error("Get league bracket error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Protected ────────────────────────────────────────────────────────────────

/** POST /api/leagues */
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, division, notes, sortOrder, tournamentId } = req.body;
    if (!name) return res.status(400).json({ error: "League name is required" });

    const league = await prisma.league.create({
      data: { name, division, notes, sortOrder: sortOrder ?? 0, tournamentId: tournamentId || null },
      include: { tournament: true, groups: true, _count: { select: { matches: true } } },
    });
    res.status(201).json(league);
  } catch (error) {
    console.error("Create league error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** PUT /api/leagues/:id */
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, division, notes, sortOrder, tournamentId } = req.body;
    const league = await prisma.league.update({
      where: { id: req.params.id },
      data: { name, division, notes, sortOrder, tournamentId: tournamentId || null },
      include: { tournament: true, groups: true, _count: { select: { matches: true } } },
    });
    res.json(league);
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ error: "League not found" });
    console.error("Update league error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** DELETE /api/leagues/:id  – cascades and deletes all matches in this league */
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.league.delete({ where: { id: req.params.id } });
    res.json({ message: "League deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ error: "League not found" });
    console.error("Delete league error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
