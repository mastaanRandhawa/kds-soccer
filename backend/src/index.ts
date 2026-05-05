import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import authRoutes from "./routes/auth";
import teamRoutes from "./routes/teams";
import matchRoutes from "./routes/matches";
import mediaRoutes from "./routes/media";
import tournamentRoutes from "./routes/tournaments";

dotenv.config();

/** Browsers send Origin without a path (e.g. github.io/repo → https://USERNAME.github.io). */
function corsOriginsFromEnv(raw: string | undefined): string | string[] {
  const fallback = "http://localhost:5173";
  const entries = (raw ?? fallback)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const normalized = entries.map((entry) => {
    try {
      return new URL(entry).origin;
    } catch {
      return entry;
    }
  });
  const unique = [...new Set(normalized)];
  if (unique.length <= 1) return unique[0] ?? fallback;
  return unique;
}

const app = express();
const PORT = process.env.PORT || 3001;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "KDS Soccer Tournament API",
      version: "1.0.0",
      description: "API for managing soccer tournament data, teams, matches, and live scores",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors({
  origin: corsOriginsFromEnv(process.env.CORS_ORIGIN),
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/tournaments", tournamentRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
});

export default app;
