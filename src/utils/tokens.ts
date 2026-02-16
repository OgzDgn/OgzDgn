import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";

export interface AccessTokenClaims extends JwtPayload {
  sub: string;
  sessionId: string;
  deviceId?: string;
}

export function createAccessToken(claims: {
  userId: string;
  sessionId: string;
  deviceId?: string;
}): string {
  return jwt.sign(
    {
      sub: claims.userId,
      sessionId: claims.sessionId,
      deviceId: claims.deviceId
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: `${env.ACCESS_TOKEN_TTL_MINUTES}m`
    }
  );
}

export function verifyAccessToken(token: string): AccessTokenClaims {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

  if (typeof decoded === "string") {
    throw new Error("Invalid access token payload");
  }

  if (!decoded.sub || !decoded.sessionId) {
    throw new Error("Access token is missing required claims");
  }

  return decoded as AccessTokenClaims;
}
