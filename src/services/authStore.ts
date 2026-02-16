import { env } from "../config/env";
import { redis } from "../lib/redis";
import { safeJsonParse } from "../utils/json";
import { createId, createOpaqueToken, sha256 } from "../utils/security";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  refreshTokenHash: string;
  rememberMe: boolean;
  deviceId?: string;
  createdAt: string;
  expiresAt: string;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function userKey(userId: string): string {
  return `auth:user:${userId}`;
}

function userByEmailKey(email: string): string {
  return `auth:userByEmail:${normalizeEmail(email)}`;
}

function sessionKey(sessionId: string): string {
  return `auth:session:${sessionId}`;
}

function refreshKey(hash: string): string {
  return `auth:refresh:${hash}`;
}

function daysToSeconds(days: number): number {
  return days * 24 * 60 * 60;
}

function sessionLifetimeSeconds(rememberMe: boolean): number {
  const ttlDays = rememberMe ? env.REMEMBER_ME_TTL_DAYS : env.REFRESH_TOKEN_TTL_DAYS;
  return daysToSeconds(ttlDays);
}

export async function createUser(params: {
  email: string;
  passwordHash: string;
}): Promise<UserRecord | null> {
  const email = normalizeEmail(params.email);
  const id = createId();
  const createdAt = new Date().toISOString();

  const reserved = await redis.set(userByEmailKey(email), id, "NX");
  if (!reserved) {
    return null;
  }

  const user: UserRecord = {
    id,
    email,
    passwordHash: params.passwordHash,
    createdAt
  };

  await redis.set(userKey(id), JSON.stringify(user));
  return user;
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const userId = await redis.get(userByEmailKey(email));
  if (!userId) {
    return null;
  }

  const raw = await redis.get(userKey(userId));
  return safeJsonParse<UserRecord>(raw);
}

export async function getUserById(userId: string): Promise<UserRecord | null> {
  const raw = await redis.get(userKey(userId));
  return safeJsonParse<UserRecord>(raw);
}

export async function createSession(params: {
  userId: string;
  rememberMe: boolean;
  deviceId?: string;
}): Promise<{ session: SessionRecord; refreshToken: string; ttlSeconds: number }> {
  const id = createId();
  const createdAt = new Date();
  const ttlSeconds = sessionLifetimeSeconds(params.rememberMe);
  const expiresAt = new Date(createdAt.getTime() + ttlSeconds * 1000);

  const refreshToken = createOpaqueToken();
  const refreshTokenHash = sha256(refreshToken);

  const session: SessionRecord = {
    id,
    userId: params.userId,
    refreshTokenHash,
    rememberMe: params.rememberMe,
    deviceId: params.deviceId,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString()
  };

  await redis
    .multi()
    .set(sessionKey(id), JSON.stringify(session), "EX", ttlSeconds)
    .set(refreshKey(refreshTokenHash), id, "EX", ttlSeconds)
    .exec();

  return { session, refreshToken, ttlSeconds };
}

export async function getSessionById(sessionId: string): Promise<SessionRecord | null> {
  const raw = await redis.get(sessionKey(sessionId));
  return safeJsonParse<SessionRecord>(raw);
}

export async function getSessionByRefreshToken(refreshToken: string): Promise<SessionRecord | null> {
  const hash = sha256(refreshToken);
  const sessionId = await redis.get(refreshKey(hash));

  if (!sessionId) {
    return null;
  }

  const session = await getSessionById(sessionId);
  if (!session) {
    await redis.del(refreshKey(hash));
    return null;
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await revokeSession(session.id);
    return null;
  }

  return session;
}

export async function rotateRefreshToken(
  session: SessionRecord
): Promise<{ session: SessionRecord; refreshToken: string }> {
  const remainingSeconds = Math.max(
    1,
    Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000)
  );

  const newToken = createOpaqueToken();
  const newHash = sha256(newToken);

  const updatedSession: SessionRecord = {
    ...session,
    refreshTokenHash: newHash
  };

  await redis
    .multi()
    .del(refreshKey(session.refreshTokenHash))
    .set(refreshKey(newHash), session.id, "EX", remainingSeconds)
    .set(sessionKey(session.id), JSON.stringify(updatedSession), "EX", remainingSeconds)
    .exec();

  return {
    session: updatedSession,
    refreshToken: newToken
  };
}

export async function revokeSession(sessionId: string): Promise<void> {
  const session = await getSessionById(sessionId);

  if (!session) {
    return;
  }

  await redis.multi().del(sessionKey(sessionId)).del(refreshKey(session.refreshTokenHash)).exec();
}
