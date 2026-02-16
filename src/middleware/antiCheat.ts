import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { redis } from "../lib/redis";

function fail(res: Response, message: string, statusCode = 400): void {
  res.status(statusCode).json({
    ok: false,
    error: message
  });
}

function parseClientTimestamp(headerValue?: string): number | null {
  if (!headerValue) {
    return null;
  }

  const parsed = Number(headerValue);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

export async function antiCheatGuard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.auth?.userId) {
    return fail(res, "Authentication required before anti-cheat checks.", 401);
  }

  const clientTs = parseClientTimestamp(req.header("x-client-ts"));
  if (!clientTs) {
    return fail(res, "x-client-ts header is required.");
  }

  const nonce = req.header("x-client-nonce");
  if (!nonce || nonce.length < 10 || nonce.length > 128) {
    return fail(res, "x-client-nonce header is required and must be 10-128 chars.");
  }

  const drift = Math.abs(Date.now() - clientTs);
  if (drift > env.CLIENT_CLOCK_SKEW_MS) {
    return fail(res, "Client clock drift is too high.", 409);
  }

  const nonceAccepted = await redis.set(
    `ac:nonce:${req.auth.userId}:${nonce}`,
    "1",
    "EX",
    120,
    "NX"
  );
  if (!nonceAccepted) {
    return fail(res, "Replay detected (nonce already used).", 409);
  }

  const actionIdRaw = req.body?.clientActionId;
  if (typeof actionIdRaw === "string" && actionIdRaw.length > 0) {
    const actionAccepted = await redis.set(
      `ac:action:${req.auth.userId}:${actionIdRaw}`,
      "1",
      "EX",
      600,
      "NX"
    );

    if (!actionAccepted) {
      return fail(res, "Duplicate clientActionId detected.", 409);
    }
  }

  next();
}
