import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Get all teams
 *     tags: [Teams]
 *     responses:
 *       200:
 *         description: List of teams
 */
router.get("/", async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      orderBy: { name: "asc" },
    });
    res.json(teams);
  } catch (error) {
    console.error("Get teams error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/teams/{id}:
 *   get:
 *     summary: Get team by ID
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team details
 *       404:
 *         description: Team not found
 */
router.get("/:id", async (req, res) => {
  try {
    const team = await prisma.team.findUnique({
      where: { id: req.params.id },
      include: {
        homeMatches: {
          include: {
            team1: true,
            team2: true,
          },
        },
        awayMatches: {
          include: {
            team1: true,
            team2: true,
          },
        },
      },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.json(team);
  } catch (error) {
    console.error("Get team error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Create a new team
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *               location:
 *                 type: string
 *               coachName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Team created
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, logoUrl, location, coachName } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Team name is required" });
    }

    const team = await prisma.team.create({
      data: {
        name,
        logoUrl,
        location,
        coachName,
      },
    });

    res.status(201).json(team);
  } catch (error) {
    console.error("Create team error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/teams/{id}:
 *   put:
 *     summary: Update a team
 *     tags: [Teams]
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
 *               name:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *               location:
 *                 type: string
 *               coachName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Team updated
 *       404:
 *         description: Team not found
 */
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, logoUrl, location, coachName } = req.body;

    const team = await prisma.team.update({
      where: { id: req.params.id },
      data: {
        name,
        logoUrl,
        location,
        coachName,
      },
    });

    res.json(team);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Team not found" });
    }
    console.error("Update team error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/teams/{id}:
 *   delete:
 *     summary: Delete a team
 *     tags: [Teams]
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
 *         description: Team deleted
 *       404:
 *         description: Team not found
 */
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.team.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Team deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Team not found" });
    }
    console.error("Delete team error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
