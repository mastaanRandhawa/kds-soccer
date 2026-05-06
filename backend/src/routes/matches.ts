import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/matches:
 *   get:
 *     summary: Get all matches
 *     tags: [Matches]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SCHEDULED, LIVE, COMPLETED]
 *       - in: query
 *         name: round
 *         schema:
 *           type: string
 *           enum: [GROUP_STAGE, ROUND_OF_16, QUARTERFINAL, SEMIFINAL, THIRD_PLACE, FINAL]
 *     responses:
 *       200:
 *         description: List of matches
 */
router.get("/", async (req, res) => {
  try {
    const { status, round, leagueId } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (round) where.round = round;
    if (leagueId) where.leagueId = leagueId;

    const matches = await prisma.match.findMany({
      where,
      include: {
        team1: true,
        team2: true,
        league: true,
        group: true,
      },
      orderBy: [
        { gameNumber: "asc" },
        { matchDate: "asc" },
      ],
    });

    res.json(matches);
  } catch (error) {
    console.error("Get matches error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/matches/live:
 *   get:
 *     summary: Get live matches
 *     tags: [Matches]
 *     responses:
 *       200:
 *         description: List of live matches
 */
router.get("/live", async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      where: { status: "LIVE" },
      include: {
        team1: true,
        team2: true,
      },
      orderBy: { matchDate: "asc" },
    });

    res.json(matches);
  } catch (error) {
    console.error("Get live matches error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/matches/bracket:
 *   get:
 *     summary: Get tournament bracket data
 *     tags: [Matches]
 *     responses:
 *       200:
 *         description: Bracket data organized by rounds
 */
router.get("/bracket", async (req, res) => {
  try {
    const { leagueId } = req.query;
    const matches = await prisma.match.findMany({
      where: leagueId ? { leagueId: leagueId as string } : undefined,
      include: {
        team1: true,
        team2: true,
      },
      orderBy: { matchDate: "asc" },
    });

    const bracket = {
      roundOf16: matches.filter((m) => m.round === "ROUND_OF_16"),
      quarterfinals: matches.filter((m) => m.round === "QUARTERFINAL"),
      semifinals: matches.filter((m) => m.round === "SEMIFINAL"),
      thirdPlace: matches.filter((m) => m.round === "THIRD_PLACE"),
      final: matches.filter((m) => m.round === "FINAL"),
    };

    res.json(bracket);
  } catch (error) {
    console.error("Get bracket error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/matches/{id}:
 *   get:
 *     summary: Get match by ID
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Match details
 *       404:
 *         description: Match not found
 */
router.get("/:id", async (req, res) => {
  try {
    const match = await prisma.match.findUnique({
      where: { id: req.params.id },
      include: {
        team1: true,
        team2: true,
      },
    });

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    res.json(match);
  } catch (error) {
    console.error("Get match error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/matches:
 *   post:
 *     summary: Create a new match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - team1Id
 *               - team2Id
 *               - round
 *             properties:
 *               team1Id:
 *                 type: string
 *               team2Id:
 *                 type: string
 *               round:
 *                 type: string
 *                 enum: [GROUP_STAGE, ROUND_OF_16, QUARTERFINAL, SEMIFINAL, THIRD_PLACE, FINAL]
 *               matchDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Match created
 */
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      team1Id, team2Id, round, matchDate, leagueId, groupId,
      gameNumber, field, homePlaceholder, awayPlaceholder, notes, status,
    } = req.body;

    if (!leagueId) return res.status(400).json({ error: "leagueId is required — every match must belong to a league" });
    if (!round)    return res.status(400).json({ error: "round is required" });

    const match = await prisma.match.create({
      data: {
        team1Id:         team1Id   || null,
        team2Id:         team2Id   || null,
        round,
        status:          status    || "SCHEDULED",
        matchDate:       matchDate ? new Date(matchDate) : null,
        leagueId,
        groupId:         groupId   || null,
        gameNumber:      gameNumber != null ? Number(gameNumber) : null,
        field:           field     || null,
        homePlaceholder: homePlaceholder || null,
        awayPlaceholder: awayPlaceholder || null,
        notes:           notes     || null,
      },
      include: { team1: true, team2: true, league: true, group: true },
    });

    res.status(201).json(match);
  } catch (error) {
    console.error("Create match error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/matches/{id}:
 *   put:
 *     summary: Update a match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               team1Id:
 *                 type: string
 *               team2Id:
 *                 type: string
 *               score1:
 *                 type: integer
 *               score2:
 *                 type: integer
 *               round:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [SCHEDULED, LIVE, COMPLETED]
 *               matchDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Match updated
 */
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      team1Id, team2Id, score1, score2, round, status, matchDate,
      leagueId, groupId, gameNumber, field, homePlaceholder, awayPlaceholder, notes,
    } = req.body;

    if (leagueId === null || leagueId === "") {
      return res.status(400).json({ error: "leagueId cannot be removed — matches must belong to a league" });
    }

    const match = await prisma.match.update({
      where: { id: req.params.id },
      data: {
        team1Id:         team1Id !== undefined ? (team1Id || null) : undefined,
        team2Id:         team2Id !== undefined ? (team2Id || null) : undefined,
        score1,
        score2,
        round,
        status,
        matchDate:       matchDate !== undefined ? (matchDate ? new Date(matchDate) : null) : undefined,
        leagueId:        leagueId  || undefined,
        groupId:         groupId   !== undefined ? (groupId  || null) : undefined,
        gameNumber:      gameNumber != null ? Number(gameNumber) : undefined,
        field:           field     !== undefined ? (field     || null) : undefined,
        homePlaceholder: homePlaceholder !== undefined ? (homePlaceholder || null) : undefined,
        awayPlaceholder: awayPlaceholder !== undefined ? (awayPlaceholder || null) : undefined,
        notes:           notes     !== undefined ? (notes     || null) : undefined,
      },
      include: { team1: true, team2: true, league: true, group: true },
    });

    res.json(match);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Match not found" });
    }
    console.error("Update match error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/matches/{id}/score:
 *   patch:
 *     summary: Update match score (for live updates)
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score1:
 *                 type: integer
 *               score2:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [SCHEDULED, LIVE, COMPLETED]
 *     responses:
 *       200:
 *         description: Score updated
 */
router.patch("/:id/score", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { score1, score2, status } = req.body;

    const match = await prisma.match.update({
      where: { id: req.params.id },
      data: {
        score1,
        score2,
        status,
      },
      include: {
        team1: true,
        team2: true,
      },
    });

    res.json(match);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Match not found" });
    }
    console.error("Update score error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/matches/{id}:
 *   delete:
 *     summary: Delete a match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Match deleted
 */
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.match.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Match deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Match not found" });
    }
    console.error("Delete match error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
