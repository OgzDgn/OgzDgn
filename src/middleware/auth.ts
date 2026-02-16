import { NextFunction, Request, Response } from "express";
import { getSessionById } from "../services/authStore";
import { verifyAccessToken } from "../utils/tokens";

function unauthorized(res: Response, message: string): void {
  res.status(401).json({
    ok: false,
    error: message
  });
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.header("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return unauthorized(res, "Missing bearer token.");
  }

  try {
    const token = authHeader.slice("Bearer ".length).trim();
    const claims = verifyAccessToken(token);

    const session = await getSessionById(claims.sessionId);
    if (!session || session.userId !== claims.sub) {
      return unauthorized(res, "Session is not valid.");
    }

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      return unauthorized(res, "Session expired.");
    }

    const requestDeviceId = req.header("x-device-id");
    if (session.deviceId && requestDeviceId && session.deviceId !== requestDeviceId) {
      return unauthorized(res, "Device mismatch detected.");
    }

    req.auth = {
      userId: claims.sub,
      sessionId: claims.sessionId,
      deviceId: claims.deviceId
    };

    next();
  } catch (error) {
    return unauthorized(res, "Invalid access token.");
  }
}
