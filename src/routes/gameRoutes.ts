import { Router } from "express";
import { z } from "zod";
import { antiCheatGuard } from "../middleware/antiCheat";
import { requireAuth } from "../middleware/auth";
import { AppError } from "../errors/appError";
import { buildFacility, getPlayerProfile, produce } from "../services/gameLogic";

const router = Router();

const BuildFacilitySchema = z.object({
  type: z.enum(["farm", "livestock", "mine", "factory"]),
  cityId: z.string().min(2).max(64),
  clientActionId: z.string().min(6).max(128).optional()
});

const ProduceSchema = z.object({
  facilityId: z.string().uuid(),
  productId: z.enum([
    "wheat",
    "cotton",
    "milk",
    "beef",
    "iron_ore",
    "coal",
    "flour",
    "steel",
    "textile"
  ]),
  cycles: z.number().int().positive().max(24),
  clientActionId: z.string().min(6).max(128).optional()
});

router.get("/profile", requireAuth, async (req, res) => {
  const profile = await getPlayerProfile(req.auth!.userId);
  return res.json({
    ok: true,
    profile
  });
});

router.post("/facilities", requireAuth, antiCheatGuard, async (req, res) => {
  const parsed = BuildFacilitySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.flatten() });
  }

  try {
    const result = await buildFacility({
      userId: req.auth!.userId,
      type: parsed.data.type,
      cityId: parsed.data.cityId
    });

    return res.status(201).json({
      ok: true,
      result
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        ok: false,
        error: error.message,
        details: error.details
      });
    }

    throw error;
  }
});

router.post("/produce", requireAuth, antiCheatGuard, async (req, res) => {
  const parsed = ProduceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.flatten() });
  }

  try {
    const result = await produce({
      userId: req.auth!.userId,
      facilityId: parsed.data.facilityId,
      productId: parsed.data.productId,
      cycles: parsed.data.cycles
    });

    return res.json({
      ok: true,
      result
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        ok: false,
        error: error.message,
        details: error.details
      });
    }

    throw error;
  }
});

export { router as gameRoutes };
