require('dotenv').config();

const bcrypt = require('bcryptjs');
const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { createServer } = require('node:http');
const { randomUUID } = require('node:crypto');
const { Pool } = require('pg');
const { Server } = require('socket.io');
const { z } = require('zod');

const PORT = Number(process.env.PORT || 4000);
const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_SSL = process.env.DATABASE_SSL === 'true';
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_TTL = process.env.JWT_TTL || '7d';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const ADMIN_BOOTSTRAP_KEY = process.env.ADMIN_BOOTSTRAP_KEY || '';
const MAX_ANTI_CHEAT_SCORE = 12;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required.');
}

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required.');
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_SSL
    ? {
        rejectUnauthorized: false,
      }
    : false,
});

const citySeeds = [
  { name: 'New York', country: 'USA', latitude: 40.7128, longitude: -74.006, taxRate: 0.18, risk: 0.17, demand: 1.3 },
  { name: 'Shanghai', country: 'China', latitude: 31.2304, longitude: 121.4737, taxRate: 0.16, risk: 0.14, demand: 1.36 },
  { name: 'Istanbul', country: 'Turkiye', latitude: 41.0082, longitude: 28.9784, taxRate: 0.22, risk: 0.23, demand: 1.22 },
  { name: 'Dubai', country: 'UAE', latitude: 25.2048, longitude: 55.2708, taxRate: 0.13, risk: 0.19, demand: 1.2 },
  { name: 'Hamburg', country: 'Germany', latitude: 53.5511, longitude: 9.9937, taxRate: 0.19, risk: 0.12, demand: 1.19 },
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, taxRate: 0.17, risk: 0.13, demand: 1.28 },
];

const routeSeeds = [
  { id: 'land-istanbul-hamburg', from: 'Istanbul', to: 'Hamburg', mode: 'Kara', distanceKm: 2200, baseRisk: 0.16 },
  { id: 'land-dubai-istanbul', from: 'Dubai', to: 'Istanbul', mode: 'Kara', distanceKm: 3100, baseRisk: 0.22 },
  { id: 'land-shanghai-hamburg', from: 'Shanghai', to: 'Hamburg', mode: 'Kara', distanceKm: 9600, baseRisk: 0.29 },
  { id: 'sea-shanghai-dubai', from: 'Shanghai', to: 'Dubai', mode: 'Deniz', distanceKm: 6500, baseRisk: 0.24 },
  { id: 'sea-newyork-hamburg', from: 'New York', to: 'Hamburg', mode: 'Deniz', distanceKm: 6200, baseRisk: 0.2 },
  { id: 'sea-dubai-tokyo', from: 'Dubai', to: 'Tokyo', mode: 'Deniz', distanceKm: 8700, baseRisk: 0.27 },
  { id: 'air-tokyo-newyork', from: 'Tokyo', to: 'New York', mode: 'Hava', distanceKm: 10800, baseRisk: 0.21 },
  { id: 'air-dubai-hamburg', from: 'Dubai', to: 'Hamburg', mode: 'Hava', distanceKm: 4850, baseRisk: 0.18 },
  { id: 'air-istanbul-shanghai', from: 'Istanbul', to: 'Shanghai', mode: 'Hava', distanceKm: 8000, baseRisk: 0.24 },
];

const crisisProfiles = {
  'Dengeli Piyasa': { fuelDelta: 0, riskDelta: { Kara: 0, Deniz: 0, Hava: 0 }, payoutCoef: 1 },
  Savas: { fuelDelta: 0.06, riskDelta: { Kara: 0.06, Deniz: 0.14, Hava: 0.08 }, payoutCoef: 0.88 },
  'Petrol Krizi': { fuelDelta: 0.16, riskDelta: { Kara: 0.04, Deniz: 0.03, Hava: 0.08 }, payoutCoef: 0.92 },
  Pandemi: { fuelDelta: -0.03, riskDelta: { Kara: 0.07, Deniz: 0.05, Hava: 0.12 }, payoutCoef: 0.86 },
  'Liman Grevi': { fuelDelta: 0.04, riskDelta: { Kara: 0.02, Deniz: 0.15, Hava: 0.04 }, payoutCoef: 0.91 },
  'Sinir Krizi': { fuelDelta: 0.08, riskDelta: { Kara: 0.16, Deniz: 0.02, Hava: 0.05 }, payoutCoef: 0.89 },
};

const allowedCrises = new Set(Object.keys(crisisProfiles));

const modeCoefficients = {
  Kara: { revenue: 1.02, cost: 0.98 },
  Deniz: { revenue: 1.12, cost: 1.06 },
  Hava: { revenue: 1.2, cost: 1.18 },
};

const cityByName = citySeeds.reduce((acc, city) => {
  acc[city.name] = city;
  return acc;
}, {});

const actionWindows = new Map();

const registerSchema = z.object({
  email: z.string().email().max(120),
  password: z.string().min(8).max(72),
  displayName: z.string().trim().min(2).max(48),
  companyName: z.string().trim().min(2).max(64),
  adminKey: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(72),
});

const joinSchema = z.object({
  displayName: z.string().trim().min(2).max(48).optional(),
  companyName: z.string().trim().min(2).max(64).optional(),
});

const shipmentSchema = z.object({
  routeId: z.string().min(3).max(96),
  insured: z.coerce.boolean().optional().default(false),
  escorted: z.coerce.boolean().optional().default(false),
  taxEvasion: z.coerce.boolean().optional().default(false),
});

const transferSchema = z.object({
  amount: z.coerce.number().positive().max(300000),
});

const setCrisisSchema = z.object({
  crisis: z.string().min(2).max(64),
});

const createSeasonSchema = z.object({
  code: z.string().trim().min(4).max(32),
  name: z.string().trim().min(4).max(96),
  maxWeeks: z.coerce.number().int().min(4).max(104).default(24),
  startsActive: z.coerce.boolean().optional().default(false),
});

const advanceWeekSchema = z.object({
  reason: z.string().trim().max(280).optional(),
});

class ApiError extends Error {
  constructor(status, message, code = 'API_ERROR', details = undefined) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function normalizeRoomKey(input) {
  const source = typeof input === 'string' ? input : 'global-room';
  const normalized = source
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!normalized) {
    return 'global-room';
  }
  return normalized.slice(0, 80);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toNumber(value) {
  if (typeof value === 'number') return value;
  return Number(value);
}

function computePlayerScore(player) {
  return Math.round(toNumber(player.cash) - toNumber(player.debt) * 0.52 + player.shipments * 25000 - player.failed_shipments * 12000);
}

function parseBearerToken(req) {
  const raw = req.headers.authorization;
  if (!raw) return null;
  if (!raw.startsWith('Bearer ')) return null;
  return raw.slice(7).trim();
}

function issueToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
      company: user.company_name,
      displayName: user.display_name,
    },
    JWT_SECRET,
    { expiresIn: JWT_TTL },
  );
}

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    companyName: user.company_name,
    role: user.role,
    createdAt: user.created_at,
  };
}

function ensureCooldown(userId, action, minIntervalMs) {
  const key = `${userId}:${action}`;
  const now = Date.now();
  const previous = actionWindows.get(key) || 0;
  const delta = now - previous;

  if (delta < minIntervalMs) {
    return { ok: false, retryMs: minIntervalMs - delta };
  }

  actionWindows.set(key, now);
  return { ok: true, retryMs: 0 };
}

function requireAllowedCrisis(crisis) {
  if (!allowedCrises.has(crisis)) {
    throw new ApiError(400, 'Gecersiz kriz secimi.', 'INVALID_CRISIS');
  }
}

async function withTransaction(run) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await run(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getUserById(client, userId) {
  const { rows } = await client.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [userId]);
  return rows[0] || null;
}

async function getUserByEmail(client, email) {
  const { rows } = await client.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email.toLowerCase()]);
  return rows[0] || null;
}

async function getOrCreateActiveSeason(client) {
  const active = await client.query(
    "SELECT * FROM seasons WHERE status = 'active' ORDER BY starts_at DESC, created_at DESC LIMIT 1",
  );
  if (active.rows[0]) {
    return active.rows[0];
  }

  const year = new Date().getUTCFullYear();
  const counterRes = await client.query("SELECT COUNT(*)::int AS count FROM seasons WHERE code LIKE $1", [`S${year}-%`]);
  const seq = String(counterRes.rows[0].count + 1).padStart(3, '0');
  const code = `S${year}-${seq}`;

  const insert = await client.query(
    `INSERT INTO seasons (id, code, name, status, week, max_weeks, active_crisis, coop_fund, starts_at, updated_at)
     VALUES ($1, $2, $3, 'active', 1, 24, 'Dengeli Piyasa', 180000, NOW(), NOW())
     RETURNING *`,
    [randomUUID(), code, `Global Season ${year}`],
  );

  return insert.rows[0];
}

async function getSeasonById(client, seasonId) {
  const { rows } = await client.query('SELECT * FROM seasons WHERE id = $1 LIMIT 1', [seasonId]);
  return rows[0] || null;
}

async function ensureRoom(client, roomKey, seasonId) {
  const normalized = normalizeRoomKey(roomKey);
  const existing = await client.query(
    'SELECT * FROM rooms WHERE room_key = $1 AND season_id = $2 LIMIT 1',
    [normalized, seasonId],
  );

  if (existing.rows[0]) {
    return existing.rows[0];
  }

  const inserted = await client.query(
    'INSERT INTO rooms (id, room_key, season_id) VALUES ($1, $2, $3) RETURNING *',
    [randomUUID(), normalized, seasonId],
  );

  return inserted.rows[0];
}

async function ensurePlayerState(client, { userId, seasonId, roomId }) {
  const existing = await client.query(
    'SELECT * FROM player_season_states WHERE user_id = $1 AND season_id = $2 LIMIT 1 FOR UPDATE',
    [userId, seasonId],
  );

  if (existing.rows[0]) {
    const row = existing.rows[0];
    if (row.room_id !== roomId) {
      const updated = await client.query(
        `UPDATE player_season_states
         SET room_id = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [roomId, row.id],
      );
      return updated.rows[0];
    }
    return row;
  }

  const inserted = await client.query(
    `INSERT INTO player_season_states
      (id, user_id, season_id, room_id, cash, debt, shipments, failed_shipments, online, anti_cheat_score, created_at, updated_at)
     VALUES
      ($1, $2, $3, $4, 900000, 300000, 0, 0, FALSE, 0, NOW(), NOW())
     RETURNING *`,
    [randomUUID(), userId, seasonId, roomId],
  );
  return inserted.rows[0];
}

async function logRoomEvent(client, { roomId, seasonId, eventType, message, metadata = {} }) {
  await client.query(
    `INSERT INTO room_events (room_id, season_id, event_type, message, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [roomId, seasonId, eventType, message, JSON.stringify(metadata)],
  );
}

async function logAntiCheat(client, { userId, seasonId, roomId, reason, severity = 1, payload = {} }) {
  await client.query(
    `INSERT INTO anti_cheat_flags (user_id, season_id, room_id, reason, severity, payload)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, seasonId, roomId, reason, severity, JSON.stringify(payload)],
  );

  await client.query(
    `UPDATE player_season_states
     SET anti_cheat_score = anti_cheat_score + $1, updated_at = NOW()
     WHERE user_id = $2 AND season_id = $3`,
    [severity, userId, seasonId],
  );
}

async function fetchSnapshot(client, { room, season }) {
  const playersRes = await client.query(
    `SELECT
       p.user_id AS id,
       u.display_name,
       u.company_name,
       p.cash,
       p.debt,
       p.shipments,
       p.failed_shipments,
       p.online,
       p.anti_cheat_score
     FROM player_season_states p
     JOIN users u ON u.id = p.user_id
     WHERE p.room_id = $1 AND p.season_id = $2
     ORDER BY p.cash DESC, p.shipments DESC`,
    [room.id, season.id],
  );

  const eventRes = await client.query(
    `SELECT event_type, message, metadata, created_at
     FROM room_events
     WHERE room_id = $1
     ORDER BY created_at DESC
     LIMIT 20`,
    [room.id],
  );

  const players = playersRes.rows.map((row) => ({
    id: row.id,
    name: row.display_name,
    company: row.company_name,
    cash: Math.round(toNumber(row.cash)),
    shipments: row.shipments,
    online: row.online,
    antiCheatScore: row.anti_cheat_score,
  }));

  const leaderboard = playersRes.rows
    .map((row) => ({
      company: row.company_name,
      score: computePlayerScore(row),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return {
    roomId: room.room_key,
    seasonId: season.id,
    seasonCode: season.code,
    seasonName: season.name,
    seasonStatus: season.status,
    week: season.week,
    maxWeeks: season.max_weeks,
    crisis: season.active_crisis,
    coopFund: Math.round(toNumber(season.coop_fund)),
    players,
    leaderboard,
    events: eventRes.rows.map((event) => ({
      type: event.event_type,
      message: event.message,
      metadata: event.metadata,
      createdAt: event.created_at,
    })),
  };
}

async function getSnapshotByRoomKey(roomKey) {
  return withTransaction(async (client) => {
    const season = await getOrCreateActiveSeason(client);
    const room = await ensureRoom(client, roomKey, season.id);
    return fetchSnapshot(client, { room, season });
  });
}

function simulateShipment({ route, activeCrisis, payload }) {
  const crisis = crisisProfiles[activeCrisis] || crisisProfiles['Dengeli Piyasa'];
  const fromCity = cityByName[route.from];
  const toCity = cityByName[route.to];
  const modeCoef = modeCoefficients[route.mode] || modeCoefficients.Kara;

  const routeScale = route.distanceKm / 1000;
  const cityDemand = (fromCity.demand + toCity.demand) / 2;
  const baseRevenue = 26000 * routeScale * cityDemand * modeCoef.revenue;
  const volatility = 0.86 + Math.random() * 0.36;
  const grossRevenue = baseRevenue * volatility * crisis.payoutCoef;

  let risk = clamp(route.baseRisk + (fromCity.risk + toCity.risk) / 2 + crisis.riskDelta[route.mode], 0.05, 0.95);
  if (payload.insured) risk -= 0.05;
  if (payload.escorted && route.mode === 'Deniz') risk -= 0.08;
  if (payload.taxEvasion) risk += 0.08;
  risk = clamp(risk, 0.05, 0.95);

  const costFuel = routeScale * 5200 * (1 + crisis.fuelDelta) * modeCoef.cost;
  const costMaintenance = routeScale * 1600 * modeCoef.cost;
  const costInsurance = payload.insured ? grossRevenue * 0.06 : 0;
  const costTax = grossRevenue * ((fromCity.taxRate + toCity.taxRate) / 2);
  const totalCost = costFuel + costMaintenance + costInsurance + costTax;

  const incident = Math.random() < risk;
  let net = grossRevenue - totalCost;
  let taxPenalty = 0;
  if (incident) {
    const damage = grossRevenue * (payload.taxEvasion ? 0.72 : 0.54);
    const insurancePayout = payload.insured ? grossRevenue * 0.2 : 0;
    taxPenalty = payload.taxEvasion ? grossRevenue * 0.14 + 18000 : 0;
    net = net - damage + insurancePayout - taxPenalty;
  }

  const coopShare = net > 0 ? net * 0.1 : 0;

  return {
    incident,
    grossRevenue: Math.round(grossRevenue),
    totalCost: Math.round(totalCost),
    risk,
    net: Math.round(net),
    coopShare: Math.round(coopShare),
    taxPenalty: Math.round(taxPenalty),
  };
}

async function advanceSeasonWeek(client, { season, room, reason }) {
  let nextWeek = season.week + 1;
  let nextStatus = season.status;
  let endSeasonNow = false;

  if (nextWeek >= season.max_weeks) {
    nextWeek = season.max_weeks;
    nextStatus = 'completed';
    endSeasonNow = true;
  }

  const updated = await client.query(
    `UPDATE seasons
     SET week = $1,
         status = $2,
         ends_at = CASE WHEN $3 THEN NOW() ELSE ends_at END,
         updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [nextWeek, nextStatus, endSeasonNow, season.id],
  );

  await logRoomEvent(client, {
    roomId: room.id,
    seasonId: season.id,
    eventType: 'season-week',
    message: `Hafta ${nextWeek}: ${reason}`,
    metadata: { week: nextWeek, status: nextStatus },
  });

  return updated.rows[0];
}

async function joinRoomState(client, { user, roomKey, displayName, companyName, markOnline }) {
  const season = await getOrCreateActiveSeason(client);
  const room = await ensureRoom(client, roomKey, season.id);

  if (displayName || companyName) {
    const nextName = displayName || user.display_name;
    const nextCompany = companyName || user.company_name;
    const updatedUserRes = await client.query(
      `UPDATE users
       SET display_name = $1, company_name = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [nextName, nextCompany, user.id],
    );
    user = updatedUserRes.rows[0];
  }

  const state = await ensurePlayerState(client, {
    userId: user.id,
    seasonId: season.id,
    roomId: room.id,
  });

  if (markOnline) {
    await client.query(
      `UPDATE player_season_states
       SET online = TRUE, last_seen_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [state.id],
    );

    await logRoomEvent(client, {
      roomId: room.id,
      seasonId: season.id,
      eventType: 'join',
      message: `${user.company_name} (oyuncu: ${user.display_name}) odaya baglandi.`,
      metadata: { userId: user.id },
    });
  }

  const refreshedSeason = await getSeasonById(client, season.id);
  const refreshedRoom = await ensureRoom(client, roomKey, season.id);
  const snapshot = await fetchSnapshot(client, { room: refreshedRoom, season: refreshedSeason });

  return {
    user,
    season: refreshedSeason,
    room: refreshedRoom,
    snapshot,
  };
}

async function processShipmentAction({ user, roomKey, payload, source }) {
  const parsed = shipmentSchema.parse(payload);
  const route = routeSeeds.find((item) => item.id === parsed.routeId);
  if (!route) {
    throw new ApiError(400, 'Gecersiz rota.', 'INVALID_ROUTE');
  }

  return withTransaction(async (client) => {
    const cooldown = ensureCooldown(user.id, 'shipment', 1800);
    if (!cooldown.ok) {
      throw new ApiError(429, `Cok hizli islem. ${Math.ceil(cooldown.retryMs / 1000)}s bekleyin.`, 'TOO_MANY_ACTIONS');
    }

    const season = await getOrCreateActiveSeason(client);
    if (season.status !== 'active') {
      throw new ApiError(409, 'Aktif sezon bulunamadi.', 'SEASON_NOT_ACTIVE');
    }

    const room = await ensureRoom(client, roomKey, season.id);
    const state = await ensurePlayerState(client, { userId: user.id, seasonId: season.id, roomId: room.id });

    if (state.anti_cheat_score >= MAX_ANTI_CHEAT_SCORE) {
      throw new ApiError(403, 'Hesap anti-hile nedeniyle kilitlendi.', 'ACCOUNT_LOCKED');
    }

    if (parsed.escorted && route.mode !== 'Deniz') {
      await logAntiCheat(client, {
        userId: user.id,
        seasonId: season.id,
        roomId: room.id,
        reason: 'escorted_non_sea_route',
        severity: 2,
        payload: { routeId: route.id, mode: route.mode, source },
      });
      parsed.escorted = false;
    }

    const result = simulateShipment({
      route,
      activeCrisis: season.active_crisis,
      payload: parsed,
    });

    if (Math.abs(result.net) > 2500000) {
      await logAntiCheat(client, {
        userId: user.id,
        seasonId: season.id,
        roomId: room.id,
        reason: 'unrealistic_profit_delta',
        severity: 5,
        payload: { routeId: route.id, result, source },
      });
      throw new ApiError(400, 'Sevkiyat sonucunda anormal deger tespit edildi.', 'ANTI_CHEAT_BLOCK');
    }

    const nextCash = toNumber(state.cash) + result.net - result.coopShare;
    if (nextCash < -300000) {
      await logAntiCheat(client, {
        userId: user.id,
        seasonId: season.id,
        roomId: room.id,
        reason: 'deep_negative_balance',
        severity: 3,
        payload: { nextCash, source },
      });
      throw new ApiError(400, 'Nakit seviyesi kritik altina dustu. Islem reddedildi.', 'INSUFFICIENT_STABILITY');
    }

    const updatedStateRes = await client.query(
      `UPDATE player_season_states
       SET cash = $1,
           shipments = shipments + 1,
           failed_shipments = failed_shipments + $2,
           online = TRUE,
           last_action_at = NOW(),
           last_seen_at = NOW(),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [nextCash, result.incident ? 1 : 0, state.id],
    );
    const updatedState = updatedStateRes.rows[0];

    const seasonFundRes = await client.query(
      `UPDATE seasons
       SET coop_fund = coop_fund + $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [result.coopShare, season.id],
    );
    const fundedSeason = seasonFundRes.rows[0];

    const changeLabel = result.net >= 0 ? `+${result.net}` : `${result.net}`;
    const seasonAfterAdvance = await advanceSeasonWeek(client, {
      season: fundedSeason,
      room,
      reason: `${user.company_name} sevkiyat yapti (${route.from} -> ${route.to}, ${route.mode}), sonuc ${changeLabel} USD.`,
    });

    await logRoomEvent(client, {
      roomId: room.id,
      seasonId: seasonAfterAdvance.id,
      eventType: 'shipment',
      message: `${user.company_name} sevkiyat sonucu: Net ${changeLabel} USD`,
      metadata: {
        routeId: route.id,
        routeMode: route.mode,
        incident: result.incident,
        risk: result.risk,
      },
    });

    const snapshot = await fetchSnapshot(client, {
      room,
      season: seasonAfterAdvance,
    });

    return {
      result: {
        ...result,
        cashAfter: Math.round(toNumber(updatedState.cash)),
      },
      snapshot,
    };
  });
}

async function processDefenseTransfer({ user, roomKey, payload }) {
  const parsed = transferSchema.parse(payload);

  return withTransaction(async (client) => {
    const cooldown = ensureCooldown(user.id, 'defense-fund', 1200);
    if (!cooldown.ok) {
      throw new ApiError(429, `Cok hizli islem. ${Math.ceil(cooldown.retryMs / 1000)}s bekleyin.`, 'TOO_MANY_ACTIONS');
    }

    const season = await getOrCreateActiveSeason(client);
    const room = await ensureRoom(client, roomKey, season.id);
    const state = await ensurePlayerState(client, { userId: user.id, seasonId: season.id, roomId: room.id });

    const amount = Math.round(parsed.amount);
    if (toNumber(state.cash) < amount) {
      throw new ApiError(400, 'Fon aktarimi icin bakiye yetersiz.', 'INSUFFICIENT_CASH');
    }

    await client.query(
      `UPDATE player_season_states
       SET cash = cash - $1, last_action_at = NOW(), last_seen_at = NOW(), online = TRUE, updated_at = NOW()
       WHERE id = $2`,
      [amount, state.id],
    );

    const seasonRes = await client.query(
      `UPDATE seasons
       SET coop_fund = coop_fund + $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [amount, season.id],
    );
    const updatedSeason = seasonRes.rows[0];

    await logRoomEvent(client, {
      roomId: room.id,
      seasonId: season.id,
      eventType: 'defense-fund',
      message: `${user.company_name} savunma fonuna ${amount} USD aktardi.`,
      metadata: { amount },
    });

    const snapshot = await fetchSnapshot(client, { room, season: updatedSeason });
    return { amount, snapshot };
  });
}

async function processNextWeek({ user, roomKey, payload }) {
  const parsed = advanceWeekSchema.parse(payload || {});

  return withTransaction(async (client) => {
    const cooldown = ensureCooldown(user.id, 'next-week', 4200);
    if (!cooldown.ok) {
      throw new ApiError(429, `Hafta atlatma cok sik. ${Math.ceil(cooldown.retryMs / 1000)}s bekleyin.`, 'TOO_MANY_ACTIONS');
    }

    const season = await getOrCreateActiveSeason(client);
    if (season.status !== 'active') {
      throw new ApiError(409, 'Sezon aktif degil.', 'SEASON_NOT_ACTIVE');
    }

    const room = await ensureRoom(client, roomKey, season.id);
    await ensurePlayerState(client, { userId: user.id, seasonId: season.id, roomId: room.id });

    const reason = parsed.reason || `${user.company_name} yeni haftayi tetikledi.`;
    const updatedSeason = await advanceSeasonWeek(client, { season, room, reason });
    const snapshot = await fetchSnapshot(client, { room, season: updatedSeason });
    return { snapshot };
  });
}

async function processSetCrisis({ user, roomKey, payload }) {
  if (user.role !== 'admin') {
    throw new ApiError(403, 'Kriz degistirmek icin admin yetkisi gerekli.', 'ADMIN_REQUIRED');
  }

  const parsed = setCrisisSchema.parse(payload);
  requireAllowedCrisis(parsed.crisis);

  return withTransaction(async (client) => {
    const season = await getOrCreateActiveSeason(client);
    const room = await ensureRoom(client, roomKey, season.id);

    const seasonRes = await client.query(
      `UPDATE seasons
       SET active_crisis = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [parsed.crisis, season.id],
    );
    const updatedSeason = seasonRes.rows[0];

    await logRoomEvent(client, {
      roomId: room.id,
      seasonId: season.id,
      eventType: 'crisis-change',
      message: `Aktif kriz ${parsed.crisis} olarak guncellendi.`,
      metadata: { crisis: parsed.crisis, by: user.id },
    });

    const snapshot = await fetchSnapshot(client, { room, season: updatedSeason });
    return { snapshot };
  });
}

async function buildSeasonLeaderboard(client, seasonId, limit = 50) {
  const result = await client.query(
    `SELECT
       u.company_name,
       p.cash,
       p.debt,
       p.shipments,
       p.failed_shipments
     FROM player_season_states p
     JOIN users u ON u.id = p.user_id
     WHERE p.season_id = $1`,
    [seasonId],
  );

  return result.rows
    .map((row) => ({
      company: row.company_name,
      score: computePlayerScore(row),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function parseTokenFromSocket(socket) {
  const fromAuth = socket.handshake.auth && typeof socket.handshake.auth.token === 'string' ? socket.handshake.auth.token : null;
  if (fromAuth) return fromAuth;
  const fromQuery = typeof socket.handshake.query.token === 'string' ? socket.handshake.query.token : null;
  return fromQuery;
}

async function loadAuthenticatedUser(req, _res, next) {
  try {
    const token = parseBearerToken(req);
    if (!token) {
      throw new ApiError(401, 'Kimlik dogrulama gerekli.', 'AUTH_REQUIRED');
    }

    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload || typeof payload.sub !== 'string') {
      throw new ApiError(401, 'Gecersiz token.', 'INVALID_TOKEN');
    }

    const user = await withTransaction((client) => getUserById(client, payload.sub));
    if (!user) {
      throw new ApiError(401, 'Kullanici bulunamadi.', 'USER_NOT_FOUND');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

function requireAdmin(req, _res, next) {
  if (!req.user || req.user.role !== 'admin') {
    next(new ApiError(403, 'Admin yetkisi gerekli.', 'ADMIN_REQUIRED'));
    return;
  }
  next();
}

const app = express();
const corsConfig =
  CORS_ORIGIN === '*'
    ? {
        origin: true,
      }
    : {
        origin: CORS_ORIGIN.split(',').map((origin) => origin.trim()),
      };

app.use(cors(corsConfig));
app.use(express.json({ limit: '1mb' }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  }),
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

app.get('/health', async (_req, res, next) => {
  try {
    const dbResult = await pool.query('SELECT NOW() AS now');
    const season = await withTransaction((client) => getOrCreateActiveSeason(client));
    res.json({
      status: 'ok',
      dbTime: dbResult.rows[0].now,
      activeSeason: {
        id: season.id,
        code: season.code,
        week: season.week,
        maxWeeks: season.max_weeks,
        status: season.status,
      },
      uptimeSec: Math.round(process.uptime()),
      now: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/world/cities', (_req, res) => {
  res.json(citySeeds);
});

app.get('/api/world/routes', (_req, res) => {
  res.json(routeSeeds);
});

app.get('/api/world/crises', (_req, res) => {
  res.json(Object.keys(crisisProfiles));
});

app.post('/api/auth/register', authLimiter, async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body || {});
    const email = input.email.toLowerCase();

    const result = await withTransaction(async (client) => {
      const existing = await getUserByEmail(client, email);
      if (existing) {
        throw new ApiError(409, 'Bu e-posta zaten kayitli.', 'EMAIL_IN_USE');
      }

      const role =
        ADMIN_BOOTSTRAP_KEY && input.adminKey && input.adminKey === ADMIN_BOOTSTRAP_KEY ? 'admin' : 'player';

      const passwordHash = await bcrypt.hash(input.password, 12);
      const insertRes = await client.query(
        `INSERT INTO users (id, email, password_hash, display_name, company_name, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING *`,
        [randomUUID(), email, passwordHash, input.displayName, input.companyName, role],
      );

      const user = insertRes.rows[0];
      const season = await getOrCreateActiveSeason(client);
      const room = await ensureRoom(client, 'global-room', season.id);
      await ensurePlayerState(client, { userId: user.id, seasonId: season.id, roomId: room.id });

      return user;
    });

    res.status(201).json({
      token: issueToken(result),
      user: sanitizeUser(result),
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/login', authLimiter, async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body || {});
    const email = input.email.toLowerCase();

    const user = await withTransaction((client) => getUserByEmail(client, email));
    if (!user) {
      throw new ApiError(401, 'E-posta veya sifre hatali.', 'INVALID_CREDENTIALS');
    }

    const match = await bcrypt.compare(input.password, user.password_hash);
    if (!match) {
      throw new ApiError(401, 'E-posta veya sifre hatali.', 'INVALID_CREDENTIALS');
    }

    res.json({
      token: issueToken(user),
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/auth/me', loadAuthenticatedUser, (req, res) => {
  res.json({
    user: sanitizeUser(req.user),
  });
});

app.get('/api/seasons/current', async (_req, res, next) => {
  try {
    const payload = await withTransaction(async (client) => {
      const season = await getOrCreateActiveSeason(client);
      const leaderboard = await buildSeasonLeaderboard(client, season.id, 20);
      return { season, leaderboard };
    });

    res.json({
      season: {
        id: payload.season.id,
        code: payload.season.code,
        name: payload.season.name,
        status: payload.season.status,
        week: payload.season.week,
        maxWeeks: payload.season.max_weeks,
        crisis: payload.season.active_crisis,
        coopFund: Math.round(toNumber(payload.season.coop_fund)),
      },
      leaderboard: payload.leaderboard,
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/seasons/:seasonId/leaderboard', async (req, res, next) => {
  try {
    const seasonId = req.params.seasonId;
    const data = await withTransaction(async (client) => {
      const season = await getSeasonById(client, seasonId);
      if (!season) {
        throw new ApiError(404, 'Sezon bulunamadi.', 'SEASON_NOT_FOUND');
      }
      const leaderboard = await buildSeasonLeaderboard(client, season.id, 100);
      return { season, leaderboard };
    });

    res.json({
      season: {
        id: data.season.id,
        code: data.season.code,
        name: data.season.name,
        status: data.season.status,
        week: data.season.week,
        maxWeeks: data.season.max_weeks,
      },
      leaderboard: data.leaderboard,
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/seasons', loadAuthenticatedUser, requireAdmin, async (req, res, next) => {
  try {
    const input = createSeasonSchema.parse(req.body || {});
    const created = await withTransaction(async (client) => {
      const existing = await client.query('SELECT id FROM seasons WHERE code = $1 LIMIT 1', [input.code]);
      if (existing.rows[0]) {
        throw new ApiError(409, 'Bu sezon kodu zaten var.', 'SEASON_CODE_IN_USE');
      }

      if (input.startsActive) {
        await client.query(
          `UPDATE seasons
           SET status = 'completed', ends_at = COALESCE(ends_at, NOW()), updated_at = NOW()
           WHERE status = 'active'`,
        );
      }

      const insertRes = await client.query(
        `INSERT INTO seasons (id, code, name, status, week, max_weeks, active_crisis, coop_fund, starts_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 1, $5, 'Dengeli Piyasa', 180000, NOW(), NOW(), NOW())
         RETURNING *`,
        [randomUUID(), input.code, input.name, input.startsActive ? 'active' : 'upcoming', input.maxWeeks],
      );

      const season = insertRes.rows[0];
      if (season.status === 'active') {
        await ensureRoom(client, 'global-room', season.id);
      }
      return season;
    });

    res.status(201).json({
      season: created,
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/seasons/:seasonId/activate', loadAuthenticatedUser, requireAdmin, async (req, res, next) => {
  try {
    const seasonId = req.params.seasonId;
    const season = await withTransaction(async (client) => {
      const target = await getSeasonById(client, seasonId);
      if (!target) {
        throw new ApiError(404, 'Sezon bulunamadi.', 'SEASON_NOT_FOUND');
      }

      await client.query(
        `UPDATE seasons
         SET status = 'completed', ends_at = COALESCE(ends_at, NOW()), updated_at = NOW()
         WHERE status = 'active' AND id <> $1`,
        [seasonId],
      );

      const activatedRes = await client.query(
        `UPDATE seasons
         SET status = 'active', starts_at = COALESCE(starts_at, NOW()), updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [seasonId],
      );

      const activated = activatedRes.rows[0];
      await ensureRoom(client, 'global-room', activated.id);
      return activated;
    });

    res.json({ season });
  } catch (error) {
    next(error);
  }
});

app.post('/api/seasons/:seasonId/advance-week', loadAuthenticatedUser, requireAdmin, async (req, res, next) => {
  try {
    const seasonId = req.params.seasonId;
    const input = advanceWeekSchema.parse(req.body || {});

    const season = await withTransaction(async (client) => {
      const current = await getSeasonById(client, seasonId);
      if (!current) {
        throw new ApiError(404, 'Sezon bulunamadi.', 'SEASON_NOT_FOUND');
      }
      if (current.status !== 'active') {
        throw new ApiError(409, 'Sezon aktif degil.', 'SEASON_NOT_ACTIVE');
      }

      const room = await ensureRoom(client, 'global-room', current.id);
      return advanceSeasonWeek(client, {
        season: current,
        room,
        reason: input.reason || `Admin ${req.user.display_name} haftayi ilerletti.`,
      });
    });

    res.json({ season });
  } catch (error) {
    next(error);
  }
});

app.get('/api/rooms/:roomId/state', async (req, res, next) => {
  try {
    const snapshot = await getSnapshotByRoomKey(req.params.roomId);
    res.json(snapshot);
  } catch (error) {
    next(error);
  }
});

app.post('/api/rooms/:roomId/join', loadAuthenticatedUser, async (req, res, next) => {
  try {
    const input = joinSchema.parse(req.body || {});
    const roomKey = normalizeRoomKey(req.params.roomId);

    const joined = await withTransaction(async (client) => {
      const user = await getUserById(client, req.user.id);
      if (!user) {
        throw new ApiError(401, 'Kullanici bulunamadi.', 'USER_NOT_FOUND');
      }
      return joinRoomState(client, {
        user,
        roomKey,
        displayName: input.displayName,
        companyName: input.companyName,
        markOnline: true,
      });
    });

    res.json({
      playerId: joined.user.id,
      snapshot: joined.snapshot,
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/rooms/:roomId/shipment', loadAuthenticatedUser, async (req, res, next) => {
  try {
    const roomKey = normalizeRoomKey(req.params.roomId);
    const result = await processShipmentAction({
      user: req.user,
      roomKey,
      payload: req.body || {},
      source: 'rest',
    });
    res.json({
      ok: true,
      result: result.result,
      snapshot: result.snapshot,
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/rooms/:roomId/transfer-defense-fund', loadAuthenticatedUser, async (req, res, next) => {
  try {
    const roomKey = normalizeRoomKey(req.params.roomId);
    const result = await processDefenseTransfer({
      user: req.user,
      roomKey,
      payload: req.body || {},
    });
    res.json({
      ok: true,
      amount: result.amount,
      snapshot: result.snapshot,
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/rooms/:roomId/next-week', loadAuthenticatedUser, async (req, res, next) => {
  try {
    const roomKey = normalizeRoomKey(req.params.roomId);
    const result = await processNextWeek({
      user: req.user,
      roomKey,
      payload: req.body || {},
    });
    res.json({
      ok: true,
      snapshot: result.snapshot,
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/rooms/:roomId/crisis', loadAuthenticatedUser, async (req, res, next) => {
  try {
    const roomKey = normalizeRoomKey(req.params.roomId);
    const result = await processSetCrisis({
      user: req.user,
      roomKey,
      payload: req.body || {},
    });
    res.json({
      ok: true,
      snapshot: result.snapshot,
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(error);

  if (error instanceof z.ZodError) {
    res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Gonderilen veri dogrulanamadi.',
      issues: error.issues,
    });
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.status).json({
      code: error.code,
      message: error.message,
      details: error.details,
    });
    return;
  }

  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'Beklenmeyen bir hata olustu.',
  });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(',').map((origin) => origin.trim()),
    methods: ['GET', 'POST'],
  },
});

async function broadcastRoom(roomKey) {
  const snapshot = await getSnapshotByRoomKey(roomKey);
  io.to(roomKey).emit('room-state', snapshot);
  return snapshot;
}

io.use(async (socket, next) => {
  try {
    const token = parseTokenFromSocket(socket);
    if (!token) {
      next(new Error('Kimlik dogrulama gerekli.'));
      return;
    }

    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload || typeof payload.sub !== 'string') {
      next(new Error('Gecersiz token.'));
      return;
    }

    const roomKey = normalizeRoomKey(
      (socket.handshake.auth && socket.handshake.auth.roomId) || socket.handshake.query.roomId || 'global-room',
    );

    const playerName =
      socket.handshake.auth && typeof socket.handshake.auth.playerName === 'string'
        ? socket.handshake.auth.playerName
        : undefined;
    const company =
      socket.handshake.auth && typeof socket.handshake.auth.company === 'string'
        ? socket.handshake.auth.company
        : undefined;

    const joinResult = await withTransaction(async (client) => {
      const user = await getUserById(client, payload.sub);
      if (!user) {
        throw new ApiError(401, 'Kullanici bulunamadi.', 'USER_NOT_FOUND');
      }
      return joinRoomState(client, {
        user,
        roomKey,
        displayName: playerName,
        companyName: company,
        markOnline: true,
      });
    });

    socket.data = {
      userId: joinResult.user.id,
      role: joinResult.user.role,
      roomKey,
      snapshot: joinResult.snapshot,
    };

    next();
  } catch (error) {
    next(new Error('Socket kimlik dogrulama basarisiz.'));
  }
});

io.on('connection', async (socket) => {
  const roomKey = socket.data.roomKey;
  socket.join(roomKey);
  socket.emit('joined', {
    playerId: socket.data.userId,
    snapshot: socket.data.snapshot,
  });

  try {
    await broadcastRoom(roomKey);
  } catch (error) {
    socket.emit('server-error', 'Oda durumu yayinlanamadi.');
  }

  socket.on('dispatch-shipment', async (payload = {}) => {
    try {
      const user = await withTransaction((client) => getUserById(client, socket.data.userId));
      if (!user) {
        throw new ApiError(401, 'Kullanici bulunamadi.', 'USER_NOT_FOUND');
      }

      const outcome = await processShipmentAction({
        user,
        roomKey: socket.data.roomKey,
        payload,
        source: 'socket',
      });

      socket.emit('shipment-result', outcome.result);
      io.to(socket.data.roomKey).emit('room-state', outcome.snapshot);
    } catch (error) {
      socket.emit('server-error', error.message || 'Sevkiyat islenemedi.');
    }
  });

  socket.on('transfer-defense-fund', async (payload = {}) => {
    try {
      const user = await withTransaction((client) => getUserById(client, socket.data.userId));
      if (!user) {
        throw new ApiError(401, 'Kullanici bulunamadi.', 'USER_NOT_FOUND');
      }

      const outcome = await processDefenseTransfer({
        user,
        roomKey: socket.data.roomKey,
        payload,
      });

      io.to(socket.data.roomKey).emit('room-state', outcome.snapshot);
    } catch (error) {
      socket.emit('server-error', error.message || 'Savunma fonu aktarimi basarisiz.');
    }
  });

  socket.on('next-week', async (payload = {}) => {
    try {
      const user = await withTransaction((client) => getUserById(client, socket.data.userId));
      if (!user) {
        throw new ApiError(401, 'Kullanici bulunamadi.', 'USER_NOT_FOUND');
      }

      const outcome = await processNextWeek({
        user,
        roomKey: socket.data.roomKey,
        payload,
      });
      io.to(socket.data.roomKey).emit('room-state', outcome.snapshot);
    } catch (error) {
      socket.emit('server-error', error.message || 'Hafta ilerletilemedi.');
    }
  });

  socket.on('set-crisis', async (payload = {}) => {
    try {
      const user = await withTransaction((client) => getUserById(client, socket.data.userId));
      if (!user) {
        throw new ApiError(401, 'Kullanici bulunamadi.', 'USER_NOT_FOUND');
      }

      const outcome = await processSetCrisis({
        user,
        roomKey: socket.data.roomKey,
        payload,
      });
      io.to(socket.data.roomKey).emit('room-state', outcome.snapshot);
    } catch (error) {
      socket.emit('server-error', error.message || 'Kriz guncellenemedi.');
    }
  });

  socket.on('disconnect', async () => {
    try {
      await withTransaction(async (client) => {
        const season = await getOrCreateActiveSeason(client);
        await client.query(
          `UPDATE player_season_states
           SET online = FALSE, last_seen_at = NOW(), updated_at = NOW()
           WHERE user_id = $1 AND season_id = $2`,
          [socket.data.userId, season.id],
        );
      });
      await broadcastRoom(socket.data.roomKey);
    } catch (error) {
      // ignore disconnect failures
    }
  });
});

async function bootstrap() {
  await pool.query('SELECT 1');

  await withTransaction(async (client) => {
    const season = await getOrCreateActiveSeason(client);
    await ensureRoom(client, 'global-room', season.id);
  });
}

bootstrap()
  .then(() => {
    httpServer.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Ticarium backend listening on :${PORT}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Backend bootstrap failed:', error);
    process.exit(1);
  });
