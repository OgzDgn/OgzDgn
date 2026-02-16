import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  createSession,
  createUser,
  getSessionByRefreshToken,
  getUserByEmail,
  getUserById,
  revokeSession,
  rotateRefreshToken
} from "../services/authStore";
import { createAccessToken } from "../utils/tokens";
import { requireAuth } from "../middleware/auth";
import { getPlayerState } from "../services/gameStore";

const router = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(120),
  deviceId: z.string().min(3).max(128).optional(),
  rememberMe: z.boolean().optional().default(false)
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(120),
  deviceId: z.string().min(3).max(128).optional(),
  rememberMe: z.boolean().optional().default(false)
});

const RefreshSchema = z.object({
  refreshToken: z.string().min(20),
  deviceId: z.string().min(3).max(128).optional()
});

function authPayload(params: {
  userId: string;
  sessionId: string;
  deviceId?: string;
  refreshToken: string;
  rememberMe: boolean;
  expiresAt: string;
}) {
  const accessToken = createAccessToken({
    userId: params.userId,
    sessionId: params.sessionId,
    deviceId: params.deviceId
  });

  return {
    accessToken,
    refreshToken: params.refreshToken,
    tokenType: "Bearer",
    rememberMe: params.rememberMe,
    refreshTokenExpiresAt: params.expiresAt
  };
}

router.post("/register", async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.flatten() });
  }

  const { email, password, deviceId, rememberMe } = parsed.data;
  const existing = await getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ ok: false, error: "This email is already registered." });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createUser({ email, passwordHash });

  if (!user) {
    return res.status(409).json({ ok: false, error: "This email is already registered." });
  }

  await getPlayerState(user.id);

  const { session, refreshToken } = await createSession({
    userId: user.id,
    rememberMe,
    deviceId
  });

  return res.status(201).json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt
    },
    auth: authPayload({
      userId: user.id,
      sessionId: session.id,
      deviceId: session.deviceId,
      rememberMe: session.rememberMe,
      refreshToken,
      expiresAt: session.expiresAt
    })
  });
});

router.post("/login", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.flatten() });
  }

  const { email, password, rememberMe, deviceId } = parsed.data;
  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ ok: false, error: "Invalid credentials." });
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) {
    return res.status(401).json({ ok: false, error: "Invalid credentials." });
  }

  const { session, refreshToken } = await createSession({
    userId: user.id,
    rememberMe,
    deviceId
  });

  return res.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email
    },
    auth: authPayload({
      userId: user.id,
      sessionId: session.id,
      deviceId: session.deviceId,
      rememberMe: session.rememberMe,
      refreshToken,
      expiresAt: session.expiresAt
    })
  });
});

router.post("/refresh", async (req, res) => {
  const parsed = RefreshSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.flatten() });
  }

  const { refreshToken, deviceId } = parsed.data;
  const session = await getSessionByRefreshToken(refreshToken);
  if (!session) {
    return res.status(401).json({ ok: false, error: "Refresh token is invalid or expired." });
  }

  if (session.deviceId && deviceId && session.deviceId !== deviceId) {
    return res.status(401).json({ ok: false, error: "Device mismatch." });
  }

  const rotated = await rotateRefreshToken(session);

  return res.json({
    ok: true,
    auth: authPayload({
      userId: session.userId,
      sessionId: rotated.session.id,
      deviceId: rotated.session.deviceId,
      rememberMe: rotated.session.rememberMe,
      refreshToken: rotated.refreshToken,
      expiresAt: rotated.session.expiresAt
    })
  });
});

router.post("/logout", requireAuth, async (req, res) => {
  await revokeSession(req.auth!.sessionId);
  return res.json({ ok: true });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await getUserById(req.auth!.userId);
  if (!user) {
    return res.status(404).json({ ok: false, error: "User not found." });
  }

  const player = await getPlayerState(user.id);

  return res.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt
    },
    player
  });
});

export { router as authRoutes };
