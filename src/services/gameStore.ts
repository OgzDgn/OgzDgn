import { PlayerState, ProductId } from "../types/game";
import { safeJsonParse } from "../utils/json";
import { redis } from "../lib/redis";

function playerKey(userId: string): string {
  return `game:player:${userId}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function starterState(userId: string): PlayerState {
  const now = nowIso();

  return {
    userId,
    balance: 15000,
    inventory: {
      wheat: 20,
      iron_ore: 12
    },
    facilities: [],
    createdAt: now,
    updatedAt: now
  };
}

export async function getPlayerState(userId: string): Promise<PlayerState> {
  const raw = await redis.get(playerKey(userId));
  const parsed = safeJsonParse<PlayerState>(raw);

  if (parsed) {
    return parsed;
  }

  const initial = starterState(userId);
  await redis.set(playerKey(userId), JSON.stringify(initial));
  return initial;
}

export async function savePlayerState(state: PlayerState): Promise<void> {
  const updated: PlayerState = {
    ...state,
    updatedAt: nowIso()
  };

  await redis.set(playerKey(state.userId), JSON.stringify(updated));
}

export async function withPlayerState<T>(
  userId: string,
  updater: (state: PlayerState) => T | Promise<T>
): Promise<{ state: PlayerState; result: T }> {
  const state = await getPlayerState(userId);
  const result = await updater(state);
  await savePlayerState(state);
  return { state, result };
}

export function inventoryAmount(state: PlayerState, productId: ProductId): number {
  return state.inventory[productId] ?? 0;
}

export function addInventory(state: PlayerState, productId: ProductId, amount: number): void {
  state.inventory[productId] = inventoryAmount(state, productId) + amount;
}

export function consumeInventory(
  state: PlayerState,
  productId: ProductId,
  amount: number
): boolean {
  const current = inventoryAmount(state, productId);
  if (current < amount) {
    return false;
  }

  state.inventory[productId] = current - amount;
  return true;
}
