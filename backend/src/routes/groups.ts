import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = Router();

// ─── Public ──────────────────────────────────────────────────────────────────

/** GET /api/groups?leagueId=X  – list groups, optionally filtered by league */
router.get("/", async (req, res) => {
  try {
    const { leagueId } = req.query;
    const groups = await prisma.group.findMany({
      where: leagueId ? { leagueId: leagueId as string } : undefined,
      include: {
        league: { select: { id: true, name: true, division: true } },
        _count: { select: { matches: true } },
      },
      orderBy: [{ leagueId: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    });
    res.json(groups);
  } catch (error) {
    console.error("Get groups error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** GET /api/groups/:id  – single group with all its matches */
router.get("/:id", async (req, res) => {
  try {
    const group = await prisma.group.findUnique({
      where: { id: req.params.id },
      include: {
        league: true,
        matches: {
          include: { team1: true, team2: true },
          orderBy: [{ gameNumber: "asc" }, { matchDate: "asc" }],
        },
      },
    });
    if (!group) return res.status(404).json({ error: "Group not found" });
    res.json(group);
  } catch (error) {
    console.error("Get group error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Protected ────────────────────────────────────────────────────────────────

/** POST /api/groups */
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { leagueId, name, sortOrder } = req.body;
    if (!leagueId) return res.status(400).json({ error: "leagueId is required" });
    if (!name) return res.status(400).json({ error: "name is required" });

    const group = await prisma.group.create({
      data: { leagueId, name, sortOrder: sortOrder ?? 0 },
      include: { league: { select: { id: true, name: true, division: true } }, _count: { select: { matches: true } } },
    });
    res.status(201).json(group);
  } catch (error: any) {
    if (error.code === "P2003") return res.status(400).json({ error: "League not found" });
    console.error("Create group error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** PUT /api/groups/:id */
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, sortOrder } = req.body;
    const group = await prisma.group.update({
      where: { id: req.params.id },
      data: { name, sortOrder },
      include: { league: { select: { id: true, name: true, division: true } }, _count: { select: { matches: true } } },
    });
    res.json(group);
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ error: "Group not found" });
    console.error("Update group error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** DELETE /api/groups/:id  – matches.groupId SET NULL via FK cascade */
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.group.delete({ where: { id: req.params.id } });
    res.json({ message: "Group deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ error: "Group not found" });
    console.error("Delete group error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
