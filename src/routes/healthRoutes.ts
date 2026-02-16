import { Router } from "express";
import { redis } from "../lib/redis";

const router = Router();

router.get("/", async (_req, res) => {
  const redisPing = await redis.ping();
  return res.json({
    ok: true,
    service: "ticarium-online-backend",
    redis: redisPing,
    now: new Date().toISOString()
  });
});

export { router as healthRoutes };
