const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { createServer } = require('node:http');
const { randomUUID } = require('node:crypto');

const PORT = Number(process.env.PORT || 4000);

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

const cityByName = citySeeds.reduce((acc, city) => {
  acc[city.name] = city;
  return acc;
}, {});

const rooms = new Map();

const modeCoefficients = {
  Kara: { revenue: 1.02, cost: 0.98 },
  Deniz: { revenue: 1.12, cost: 1.06 },
  Hava: { revenue: 1.2, cost: 1.18 },
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function createRoom(roomId) {
  return {
    roomId,
    week: 1,
    crisis: 'Dengeli Piyasa',
    coopFund: 180000,
    players: new Map(),
    events: [`Hafta 1: ${roomId} odasi olusturuldu.`],
  };
}

function getRoom(roomId) {
  const trimmed = (roomId || 'global-room').trim() || 'global-room';
  if (!rooms.has(trimmed)) {
    rooms.set(trimmed, createRoom(trimmed));
  }
  return rooms.get(trimmed);
}

function upsertPlayer(room, payload) {
  const candidateId = typeof payload.playerId === 'string' ? payload.playerId.trim() : '';
  const id = candidateId || randomUUID();
  const existing = room.players.get(id);

  if (existing) {
    existing.name = payload.name || existing.name;
    existing.company = payload.company || existing.company;
    existing.online = true;
    existing.lastSeenAt = Date.now();
    return existing;
  }

  const player = {
    id,
    name: payload.name || 'Guest',
    company: payload.company || 'Independent',
    cash: 900000,
    debt: 300000,
    shipments: 0,
    failedShipments: 0,
    online: true,
    lastSeenAt: Date.now(),
  };
  room.players.set(id, player);
  room.events.unshift(`Hafta ${room.week}: ${player.company} birlige katildi.`);
  room.events = room.events.slice(0, 20);
  return player;
}

function computePlayerScore(player) {
  return Math.round(player.cash - player.debt * 0.52 + player.shipments * 25000 - player.failedShipments * 12000);
}

function buildSnapshot(room) {
  const players = Array.from(room.players.values()).map((player) => ({
    id: player.id,
    name: player.name,
    company: player.company,
    cash: Math.round(player.cash),
    shipments: player.shipments,
    online: player.online,
  }));

  const leaderboard = Array.from(room.players.values())
    .map((player) => ({
      company: player.company,
      score: computePlayerScore(player),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return {
    roomId: room.roomId,
    week: room.week,
    crisis: room.crisis,
    coopFund: Math.round(room.coopFund),
    players,
    leaderboard,
    events: room.events,
  };
}

function advanceWeek(room, reason) {
  room.week += 1;
  room.events.unshift(`Hafta ${room.week}: ${reason}`);
  room.events = room.events.slice(0, 20);
}

function applyShipment(room, player, payload) {
  const route = routeSeeds.find((item) => item.id === payload.routeId);
  if (!route) {
    return {
      ok: false,
      message: 'Gecersiz rota.',
    };
  }

  const fromCity = cityByName[route.from];
  const toCity = cityByName[route.to];
  const crisis = crisisProfiles[room.crisis] || crisisProfiles['Dengeli Piyasa'];
  const modeCoef = modeCoefficients[route.mode] || modeCoefficients.Kara;

  const routeScale = route.distanceKm / 1000;
  const cityDemand = (fromCity.demand + toCity.demand) / 2;
  const baseRevenue = 26000 * routeScale * cityDemand * modeCoef.revenue;
  const volatility = 0.86 + Math.random() * 0.36;
  const grossRevenue = baseRevenue * volatility * crisis.payoutCoef;

  const modeRisk = crisis.riskDelta[route.mode] || 0;
  let risk = clamp(route.baseRisk + (fromCity.risk + toCity.risk) / 2 + modeRisk, 0.07, 0.9);
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
  if (incident) {
    const damage = grossRevenue * (payload.taxEvasion ? 0.72 : 0.54);
    const insurancePayout = payload.insured ? grossRevenue * 0.2 : 0;
    const taxPenalty = payload.taxEvasion ? grossRevenue * 0.14 + 18000 : 0;
    net = net - damage + insurancePayout - taxPenalty;
    player.failedShipments += 1;
  }

  const coopShare = net > 0 ? net * 0.1 : 0;
  room.coopFund += coopShare;

  player.cash += net - coopShare;
  player.shipments += 1;
  player.lastSeenAt = Date.now();

  const changeLabel = net >= 0 ? `+${Math.round(net)}` : `${Math.round(net)}`;
  advanceWeek(
    room,
    `${player.company} sevkiyat yapti (${route.from} -> ${route.to}, ${route.mode}), sonuc ${changeLabel} USD.`,
  );

  return {
    ok: true,
    result: {
      incident,
      net: Math.round(net),
      risk,
      grossRevenue: Math.round(grossRevenue),
      totalCost: Math.round(totalCost),
    },
  };
}

function transferDefenseFund(room, player, amount) {
  const safeAmount = clamp(Number(amount || 0), 0, 300000);
  if (safeAmount <= 0 || player.cash < safeAmount) {
    return { ok: false, message: 'Fon aktarimi icin bakiye yetersiz.' };
  }

  player.cash -= safeAmount;
  room.coopFund += safeAmount;
  advanceWeek(room, `${player.company} savunma fonuna ${Math.round(safeAmount)} USD aktardi.`);
  return { ok: true };
}

function setCrisis(room, crisis) {
  if (!crisisProfiles[crisis]) {
    return { ok: false, message: 'Gecersiz kriz secimi.' };
  }
  room.crisis = crisis;
  advanceWeek(room, `Aktif sezon krizi degisti: ${crisis}.`);
  return { ok: true };
}

function broadcastRoom(io, roomId) {
  const room = getRoom(roomId);
  io.to(roomId).emit('room-state', buildSnapshot(room));
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    rooms: rooms.size,
    uptimeSec: Math.round(process.uptime()),
    now: new Date().toISOString(),
  });
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

app.get('/api/rooms/:roomId/state', (req, res) => {
  const room = getRoom(req.params.roomId);
  res.json(buildSnapshot(room));
});

app.post('/api/rooms/:roomId/join', (req, res) => {
  const room = getRoom(req.params.roomId);
  const player = upsertPlayer(room, {
    playerId: req.body.playerId,
    name: req.body.name,
    company: req.body.company,
  });
  res.json({
    playerId: player.id,
    snapshot: buildSnapshot(room),
  });
});

app.post('/api/rooms/:roomId/shipment', (req, res) => {
  const room = getRoom(req.params.roomId);
  const player = room.players.get(req.body.playerId);
  if (!player) {
    res.status(404).json({ message: 'Oyuncu bulunamadi.' });
    return;
  }
  const result = applyShipment(room, player, req.body);
  if (!result.ok) {
    res.status(400).json(result);
    return;
  }
  res.json({
    ...result,
    snapshot: buildSnapshot(room),
  });
});

app.post('/api/rooms/:roomId/transfer-defense-fund', (req, res) => {
  const room = getRoom(req.params.roomId);
  const player = room.players.get(req.body.playerId);
  if (!player) {
    res.status(404).json({ message: 'Oyuncu bulunamadi.' });
    return;
  }
  const result = transferDefenseFund(room, player, req.body.amount);
  if (!result.ok) {
    res.status(400).json(result);
    return;
  }
  res.json({
    ...result,
    snapshot: buildSnapshot(room),
  });
});

app.post('/api/rooms/:roomId/next-week', (req, res) => {
  const room = getRoom(req.params.roomId);
  const player = room.players.get(req.body.playerId);
  if (!player) {
    res.status(404).json({ message: 'Oyuncu bulunamadi.' });
    return;
  }
  advanceWeek(room, `${player.company} haftayi atlatti.`);
  res.json({
    ok: true,
    snapshot: buildSnapshot(room),
  });
});

app.post('/api/rooms/:roomId/crisis', (req, res) => {
  const room = getRoom(req.params.roomId);
  const result = setCrisis(room, req.body.crisis);
  if (!result.ok) {
    res.status(400).json(result);
    return;
  }
  res.json({
    ...result,
    snapshot: buildSnapshot(room),
  });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  const roomId =
    typeof socket.handshake.query.roomId === 'string' ? socket.handshake.query.roomId : 'global-room';
  const name = typeof socket.handshake.query.playerName === 'string' ? socket.handshake.query.playerName : 'Guest';
  const company =
    typeof socket.handshake.query.company === 'string' ? socket.handshake.query.company : 'Independent';
  const playerIdFromQuery =
    typeof socket.handshake.query.playerId === 'string' ? socket.handshake.query.playerId : undefined;

  const room = getRoom(roomId);
  const player = upsertPlayer(room, {
    playerId: playerIdFromQuery,
    name,
    company,
  });

  player.online = true;
  player.lastSeenAt = Date.now();
  socket.data = {
    roomId: room.roomId,
    playerId: player.id,
  };
  socket.join(room.roomId);
  socket.emit('joined', {
    playerId: player.id,
    snapshot: buildSnapshot(room),
  });
  broadcastRoom(io, room.roomId);

  socket.on('dispatch-shipment', (payload = {}) => {
    const activeRoom = getRoom(socket.data.roomId);
    const activePlayer = activeRoom.players.get(socket.data.playerId);
    if (!activePlayer) {
      socket.emit('server-error', 'Oyuncu odada bulunamadi.');
      return;
    }

    const result = applyShipment(activeRoom, activePlayer, payload);
    if (!result.ok) {
      socket.emit('server-error', result.message || 'Sevkiyat islenemedi.');
      return;
    }
    broadcastRoom(io, activeRoom.roomId);
  });

  socket.on('transfer-defense-fund', (payload = {}) => {
    const activeRoom = getRoom(socket.data.roomId);
    const activePlayer = activeRoom.players.get(socket.data.playerId);
    if (!activePlayer) {
      socket.emit('server-error', 'Oyuncu odada bulunamadi.');
      return;
    }

    const result = transferDefenseFund(activeRoom, activePlayer, payload.amount);
    if (!result.ok) {
      socket.emit('server-error', result.message || 'Fon aktarimi basarisiz.');
      return;
    }
    broadcastRoom(io, activeRoom.roomId);
  });

  socket.on('next-week', () => {
    const activeRoom = getRoom(socket.data.roomId);
    const activePlayer = activeRoom.players.get(socket.data.playerId);
    if (!activePlayer) {
      socket.emit('server-error', 'Oyuncu odada bulunamadi.');
      return;
    }
    advanceWeek(activeRoom, `${activePlayer.company} yeni haftayi tetikledi.`);
    broadcastRoom(io, activeRoom.roomId);
  });

  socket.on('set-crisis', (payload = {}) => {
    const activeRoom = getRoom(socket.data.roomId);
    const result = setCrisis(activeRoom, payload.crisis);
    if (!result.ok) {
      socket.emit('server-error', result.message || 'Kriz guncellenemedi.');
      return;
    }
    broadcastRoom(io, activeRoom.roomId);
  });

  socket.on('disconnect', () => {
    const activeRoom = rooms.get(socket.data.roomId);
    if (!activeRoom) {
      return;
    }
    const activePlayer = activeRoom.players.get(socket.data.playerId);
    if (activePlayer) {
      activePlayer.online = false;
      activePlayer.lastSeenAt = Date.now();
    }
    broadcastRoom(io, activeRoom.roomId);
  });
});

httpServer.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Ticarium multiplayer backend listening on :${PORT}`);
});
