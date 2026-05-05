import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/tournaments:
 *   get:
 *     summary: Get all tournaments
 *     tags: [Tournaments]
 *     responses:
 *       200:
 *         description: List of tournaments
 */
router.get("/", async (req, res) => {
  try {
    const tournaments = await prisma.tournament.findMany({
      orderBy: { startDate: "desc" },
    });
    res.json(tournaments);
  } catch (error) {
    console.error("Get tournaments error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/tournaments/active:
 *   get:
 *     summary: Get active tournament
 *     tags: [Tournaments]
 *     responses:
 *       200:
 *         description: Active tournament details
 */
router.get("/active", async (req, res) => {
  try {
    const tournament = await prisma.tournament.findFirst({
      where: { isActive: true },
    });

    if (!tournament) {
      return res.status(404).json({ error: "No active tournament found" });
    }

    res.json(tournament);
  } catch (error) {
    console.error("Get active tournament error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/tournaments/{id}:
 *   get:
 *     summary: Get tournament by ID
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tournament details
 */
router.get("/:id", async (req, res) => {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: req.params.id },
    });

    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }

    res.json(tournament);
  } catch (error) {
    console.error("Get tournament error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/tournaments:
 *   post:
 *     summary: Create a new tournament
 *     tags: [Tournaments]
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
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Tournament created
 */
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, startDate, endDate, isActive } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Tournament name is required" });
    }

    const tournament = await prisma.tournament.create({
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive ?? true,
      },
    });

    res.status(201).json(tournament);
  } catch (error) {
    console.error("Create tournament error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/tournaments/{id}:
 *   put:
 *     summary: Update a tournament
 *     tags: [Tournaments]
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
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Tournament updated
 */
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, startDate, endDate, isActive } = req.body;

    const tournament = await prisma.tournament.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive,
      },
    });

    res.json(tournament);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Tournament not found" });
    }
    console.error("Update tournament error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/tournaments/{id}:
 *   delete:
 *     summary: Delete a tournament
 *     tags: [Tournaments]
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
 *         description: Tournament deleted
 */
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.tournament.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Tournament deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Tournament not found" });
    }
    console.error("Delete tournament error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
