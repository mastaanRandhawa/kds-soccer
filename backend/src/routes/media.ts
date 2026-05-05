import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/media:
 *   get:
 *     summary: Get all media
 *     tags: [Media]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of media items
 */
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;

    const where: any = {};
    if (category) where.category = category;

    const media = await prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(media);
  } catch (error) {
    console.error("Get media error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/media/{id}:
 *   get:
 *     summary: Get media by ID
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Media details
 *       404:
 *         description: Media not found
 */
router.get("/:id", async (req, res) => {
  try {
    const media = await prisma.media.findUnique({
      where: { id: req.params.id },
    });

    if (!media) {
      return res.status(404).json({ error: "Media not found" });
    }

    res.json(media);
  } catch (error) {
    console.error("Get media error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/media:
 *   post:
 *     summary: Create new media entry
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Media created
 */
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { imageUrl, description, category } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "Image URL is required" });
    }

    const media = await prisma.media.create({
      data: {
        imageUrl,
        description,
        category,
      },
    });

    res.status(201).json(media);
  } catch (error) {
    console.error("Create media error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/media/{id}:
 *   put:
 *     summary: Update media
 *     tags: [Media]
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
 *               imageUrl:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Media updated
 */
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { imageUrl, description, category } = req.body;

    const media = await prisma.media.update({
      where: { id: req.params.id },
      data: {
        imageUrl,
        description,
        category,
      },
    });

    res.json(media);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Media not found" });
    }
    console.error("Update media error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/media/{id}:
 *   delete:
 *     summary: Delete media
 *     tags: [Media]
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
 *         description: Media deleted
 */
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.media.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Media deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Media not found" });
    }
    console.error("Delete media error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
