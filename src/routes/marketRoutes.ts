import { Router } from "express";
import { z } from "zod";
import { antiCheatGuard } from "../middleware/antiCheat";
import { requireAuth } from "../middleware/auth";
import { AppError } from "../errors/appError";
import {
  createAuction,
  getActiveAuctions,
  getGlobalSales,
  placeAuctionBid,
  sellOnGlobalMarket,
  settleAuction
} from "../services/marketLogic";

const router = Router();

const ProductSchema = z.enum([
  "wheat",
  "cotton",
  "milk",
  "beef",
  "iron_ore",
  "coal",
  "flour",
  "steel",
  "textile"
]);

const GlobalSellSchema = z.object({
  productId: ProductSchema,
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  clientActionId: z.string().min(6).max(128).optional()
});

const CreateAuctionSchema = z.object({
  productId: ProductSchema,
  quantity: z.number().int().positive(),
  minBid: z.number().positive(),
  durationMinutes: z.number().int().min(10).max(720),
  clientActionId: z.string().min(6).max(128).optional()
});

const PlaceBidSchema = z.object({
  bidAmount: z.number().positive(),
  clientActionId: z.string().min(6).max(128).optional()
});

router.get("/global/sales", async (req, res) => {
  const limit = Number(req.query.limit ?? 20);
  const sales = await getGlobalSales(Number.isFinite(limit) ? limit : 20);

  return res.json({
    ok: true,
    sales
  });
});

router.post("/global/sell", requireAuth, antiCheatGuard, async (req, res) => {
  const parsed = GlobalSellSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.flatten() });
  }

  try {
    const sale = await sellOnGlobalMarket({
      userId: req.auth!.userId,
      productId: parsed.data.productId,
      quantity: parsed.data.quantity,
      unitPrice: parsed.data.unitPrice
    });

    return res.status(201).json({
      ok: true,
      sale
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

router.get("/auctions", async (req, res) => {
  const limit = Number(req.query.limit ?? 50);
  const auctions = await getActiveAuctions(Number.isFinite(limit) ? limit : 50);
  return res.json({ ok: true, auctions });
});

router.post("/auctions", requireAuth, antiCheatGuard, async (req, res) => {
  const parsed = CreateAuctionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.flatten() });
  }

  try {
    const auction = await createAuction({
      userId: req.auth!.userId,
      productId: parsed.data.productId,
      quantity: parsed.data.quantity,
      minBid: parsed.data.minBid,
      durationMinutes: parsed.data.durationMinutes
    });

    return res.status(201).json({
      ok: true,
      auction
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

router.post("/auctions/:auctionId/bid", requireAuth, antiCheatGuard, async (req, res) => {
  const parsed = PlaceBidSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.flatten() });
  }

  const auctionId = Array.isArray(req.params.auctionId)
    ? req.params.auctionId[0]
    : req.params.auctionId;
  if (!auctionId) {
    return res.status(400).json({ ok: false, error: "auctionId is required." });
  }

  try {
    const auction = await placeAuctionBid({
      userId: req.auth!.userId,
      auctionId,
      bidAmount: parsed.data.bidAmount
    });

    return res.json({
      ok: true,
      auction
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

router.post("/auctions/:auctionId/settle", requireAuth, async (req, res) => {
  const auctionId = Array.isArray(req.params.auctionId)
    ? req.params.auctionId[0]
    : req.params.auctionId;
  if (!auctionId) {
    return res.status(400).json({ ok: false, error: "auctionId is required." });
  }

  try {
    const auction = await settleAuction(auctionId);
    return res.json({
      ok: true,
      auction
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

export { router as marketRoutes };
