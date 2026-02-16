import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { authRoutes } from "./routes/authRoutes";
import { gameRoutes } from "./routes/gameRoutes";
import { healthRoutes } from "./routes/healthRoutes";
import { marketRoutes } from "./routes/marketRoutes";
import { worldRoutes } from "./routes/worldRoutes";
import { AppError } from "./errors/appError";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: "*"
  })
);
app.use(express.json({ limit: "1mb" }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 400,
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 70,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(globalLimiter);

app.use("/health", healthRoutes);
app.use("/auth", authLimiter, authRoutes);
app.use("/world", worldRoutes);
app.use("/game", gameRoutes);
app.use("/market", marketRoutes);

app.use((_req, res) => {
  return res.status(404).json({
    ok: false,
    error: "Not found"
  });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      ok: false,
      error: error.message,
      details: error.details
    });
  }

  // eslint-disable-next-line no-console
  console.error("[api] unhandled error", error);

  return res.status(500).json({
    ok: false,
    error: "Internal server error"
  });
});

export { app };
