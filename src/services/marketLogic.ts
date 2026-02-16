import { AppError } from "../errors/appError";
import { redis } from "../lib/redis";
import { Auction, MarketSale, ProductId, PRODUCT_CATALOG } from "../types/game";
import { createId } from "../utils/security";
import {
  addInventory,
  consumeInventory,
  getPlayerState,
  savePlayerState,
  withPlayerState
} from "./gameStore";
import { safeJsonParse } from "../utils/json";

const GLOBAL_SALES_KEY = "market:global:sales";
const AUCTION_ACTIVE_SET_KEY = "market:auctions:active";
const MARKET_TAX_RATE = 0.03;
const AUCTION_SELLER_FEE_RATE = 0.02;

function auctionKey(auctionId: string): string {
  return `market:auction:${auctionId}`;
}

function parsePositiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new AppError(`${field} must be a positive integer.`, 400);
  }

  return value;
}

function parsePositiveNumber(value: number, field: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new AppError(`${field} must be a positive number.`, 400);
  }

  return value;
}

export async function sellOnGlobalMarket(params: {
  userId: string;
  productId: ProductId;
  quantity: number;
  unitPrice: number;
}): Promise<MarketSale> {
  const quantity = parsePositiveInteger(params.quantity, "quantity");
  const unitPrice = parsePositiveNumber(params.unitPrice, "unitPrice");

  if (!PRODUCT_CATALOG[params.productId]) {
    throw new AppError("Unknown productId.", 400);
  }

  const { result } = await withPlayerState(params.userId, (state) => {
    const hasStock = consumeInventory(state, params.productId, quantity);
    if (!hasStock) {
      throw new AppError("Insufficient stock to sell.", 400);
    }

    const grossRevenue = Number((quantity * unitPrice).toFixed(2));
    const netRevenue = Number((grossRevenue * (1 - MARKET_TAX_RATE)).toFixed(2));
    state.balance = Number((state.balance + netRevenue).toFixed(2));

    return {
      grossRevenue,
      netRevenue
    };
  });

  const sale: MarketSale = {
    id: createId(),
    userId: params.userId,
    productId: params.productId,
    quantity,
    unitPrice,
    grossRevenue: result.grossRevenue,
    netRevenue: result.netRevenue,
    taxRate: MARKET_TAX_RATE,
    createdAt: new Date().toISOString()
  };

  await redis.lpush(GLOBAL_SALES_KEY, JSON.stringify(sale));
  await redis.ltrim(GLOBAL_SALES_KEY, 0, 199);

  return sale;
}

export async function getGlobalSales(limit = 20): Promise<MarketSale[]> {
  const clampedLimit = Math.min(Math.max(limit, 1), 100);
  const values = await redis.lrange(GLOBAL_SALES_KEY, 0, clampedLimit - 1);
  return values
    .map((value) => safeJsonParse<MarketSale>(value))
    .filter((value): value is MarketSale => value !== null);
}

export async function createAuction(params: {
  userId: string;
  productId: ProductId;
  quantity: number;
  minBid: number;
  durationMinutes: number;
}): Promise<Auction> {
  const quantity = parsePositiveInteger(params.quantity, "quantity");
  const minBid = parsePositiveNumber(params.minBid, "minBid");
  const durationMinutes = parsePositiveInteger(params.durationMinutes, "durationMinutes");

  if (durationMinutes < 10 || durationMinutes > 720) {
    throw new AppError("durationMinutes must be between 10 and 720.", 400);
  }

  if (!PRODUCT_CATALOG[params.productId]) {
    throw new AppError("Unknown productId.", 400);
  }

  await withPlayerState(params.userId, (state) => {
    const hasStock = consumeInventory(state, params.productId, quantity);
    if (!hasStock) {
      throw new AppError("Insufficient stock to create auction.", 400);
    }
    return true;
  });

  const createdAt = new Date();
  const endsAt = new Date(createdAt.getTime() + durationMinutes * 60 * 1000);

  const auction: Auction = {
    id: createId(),
    sellerUserId: params.userId,
    productId: params.productId,
    quantity,
    minBid,
    highestBid: 0,
    highestBidderUserId: null,
    endsAt: endsAt.toISOString(),
    settledAt: null,
    createdAt: createdAt.toISOString()
  };

  const keepSeconds = durationMinutes * 60 + 24 * 60 * 60;

  await redis
    .multi()
    .set(auctionKey(auction.id), JSON.stringify(auction), "EX", keepSeconds)
    .sadd(AUCTION_ACTIVE_SET_KEY, auction.id)
    .exec();

  return auction;
}

export async function getAuctionById(auctionId: string): Promise<Auction | null> {
  const raw = await redis.get(auctionKey(auctionId));
  return safeJsonParse<Auction>(raw);
}

export async function getActiveAuctions(limit = 50): Promise<Auction[]> {
  const ids = await redis.smembers(AUCTION_ACTIVE_SET_KEY);

  const auctions: Auction[] = [];
  const now = Date.now();

  for (const id of ids) {
    const auction = await getAuctionById(id);
    if (!auction) {
      await redis.srem(AUCTION_ACTIVE_SET_KEY, id);
      continue;
    }

    if (auction.settledAt) {
      await redis.srem(AUCTION_ACTIVE_SET_KEY, id);
      continue;
    }

    if (new Date(auction.endsAt).getTime() <= now) {
      continue;
    }

    auctions.push(auction);
    if (auctions.length >= limit) {
      break;
    }
  }

  auctions.sort((a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime());
  return auctions;
}

export async function placeAuctionBid(params: {
  userId: string;
  auctionId: string;
  bidAmount: number;
}): Promise<Auction> {
  const bidAmount = parsePositiveNumber(params.bidAmount, "bidAmount");
  const auction = await getAuctionById(params.auctionId);

  if (!auction) {
    throw new AppError("Auction not found.", 404);
  }

  if (auction.settledAt) {
    throw new AppError("Auction already settled.", 400);
  }

  if (auction.sellerUserId === params.userId) {
    throw new AppError("Seller cannot bid on own auction.", 400);
  }

  if (new Date(auction.endsAt).getTime() <= Date.now()) {
    throw new AppError("Auction already ended. Settle it first.", 400);
  }

  const minRequired = auction.highestBid > 0 ? auction.highestBid + 1 : auction.minBid;
  if (bidAmount < minRequired) {
    throw new AppError("Bid is below required minimum.", 400, { minRequired });
  }

  const bidderState = await getPlayerState(params.userId);
  if (bidderState.balance < bidAmount) {
    throw new AppError("Insufficient balance for bid.", 400);
  }

  const updated: Auction = {
    ...auction,
    highestBid: Number(bidAmount.toFixed(2)),
    highestBidderUserId: params.userId
  };

  const ttlSeconds = Math.max(
    60,
    Math.floor((new Date(auction.endsAt).getTime() - Date.now()) / 1000) + 24 * 60 * 60
  );

  await redis.set(auctionKey(updated.id), JSON.stringify(updated), "EX", ttlSeconds);
  return updated;
}

export async function settleAuction(auctionId: string): Promise<Auction> {
  const auction = await getAuctionById(auctionId);
  if (!auction) {
    throw new AppError("Auction not found.", 404);
  }

  if (auction.settledAt) {
    return auction;
  }

  if (new Date(auction.endsAt).getTime() > Date.now()) {
    throw new AppError("Auction is still active.", 400);
  }

  const settledAt = new Date().toISOString();
  const updatedAuction: Auction = { ...auction, settledAt };

  if (!auction.highestBidderUserId || auction.highestBid <= 0) {
    await withPlayerState(auction.sellerUserId, (state) => {
      addInventory(state, auction.productId, auction.quantity);
      return true;
    });
  } else {
    const sellerState = await getPlayerState(auction.sellerUserId);
    const bidderState = await getPlayerState(auction.highestBidderUserId);

    if (bidderState.balance < auction.highestBid) {
      addInventory(sellerState, auction.productId, auction.quantity);
      await savePlayerState(sellerState);
    } else {
      bidderState.balance = Number((bidderState.balance - auction.highestBid).toFixed(2));
      addInventory(bidderState, auction.productId, auction.quantity);

      const sellerIncome = Number((auction.highestBid * (1 - AUCTION_SELLER_FEE_RATE)).toFixed(2));
      sellerState.balance = Number((sellerState.balance + sellerIncome).toFixed(2));

      await Promise.all([savePlayerState(sellerState), savePlayerState(bidderState)]);
    }
  }

  await redis
    .multi()
    .set(auctionKey(auctionId), JSON.stringify(updatedAuction), "EX", 24 * 60 * 60)
    .srem(AUCTION_ACTIVE_SET_KEY, auctionId)
    .exec();

  return updatedAuction;
}
