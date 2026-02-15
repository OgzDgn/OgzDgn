import { randomUUID } from 'node:crypto'
import { createServer } from 'node:http'
import cors from 'cors'
import express from 'express'
import { WebSocket, WebSocketServer } from 'ws'

const PORT = Number(process.env.PORT ?? 8787)

const REGION_POOL = [
  'Kuresel Lig',
  'Avrupa Sunucusu',
  'Asya Pasifik Sunucusu',
  'Amerika Sunucusu',
  'Hardcore Ekonomi',
]

const BOT_ROSTER = [
  { id: 'bot-baltic', company: 'Baltic Crown', captain: 'Lara Demir', leagueMmr: 1565 },
  { id: 'bot-atlas', company: 'Atlas Meridian', captain: 'Mina Yildiz', leagueMmr: 1480 },
  { id: 'bot-sino', company: 'Sino Harbor Union', captain: 'Kenji Sato', leagueMmr: 1432 },
  { id: 'bot-gulf', company: 'Gulf Frontier', captain: 'Noor Al Fahim', leagueMmr: 1370 },
]

const TENDER_TEMPLATES = [
  {
    id: 'tender-1',
    title: 'Dubai Petrol Tedarik Ihalesi',
    routeLabel: 'Dubai -> Istanbul',
    mode: 'sea',
    tons: 520,
    minBid: 1750000,
    durationSec: 130,
    bidStepRate: 0.018,
  },
  {
    id: 'tender-2',
    title: 'Hamburg Medikal Acil Kontrat',
    routeLabel: 'Istanbul -> Hamburg',
    mode: 'land',
    tons: 180,
    minBid: 860000,
    durationSec: 120,
    bidStepRate: 0.016,
  },
  {
    id: 'tender-3',
    title: 'Singapore Nadir Maden Kontrati',
    routeLabel: 'Singapore -> Shanghai',
    mode: 'sea',
    tons: 210,
    minBid: 1480000,
    durationSec: 150,
    bidStepRate: 0.021,
  },
  {
    id: 'tender-4',
    title: 'Rotterdam Tahil Koridoru',
    routeLabel: 'Rotterdam -> Istanbul',
    mode: 'land',
    tons: 280,
    minBid: 940000,
    durationSec: 125,
    bidStepRate: 0.014,
  },
  {
    id: 'tender-5',
    title: 'Mumbai Medikal Hava Ekseni',
    routeLabel: 'Mumbai -> Dubai',
    mode: 'air',
    tons: 120,
    minBid: 1210000,
    durationSec: 118,
    bidStepRate: 0.017,
  },
]

const clients = new Map()
const sseSubscribers = new Set()
const regionState = new Map()

const nowLabel = () => {
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

const money = (value) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

const validRegion = (value) => (REGION_POOL.includes(value) ? value : REGION_POOL[0])

const createTender = (template) => ({
  ...template,
  status: 'open',
  round: 1,
  currentBid: template.minBid,
  currentLeader: 'Sistem',
  bidStep: Math.max(5000, Math.round(template.minBid * template.bidStepRate)),
  closeAt: Date.now() + template.durationSec * 1000,
  reopenAt: null,
})

const createRegionState = (regionName) => ({
  regionName,
  tenders: TENDER_TEMPLATES.map((template) => createTender(template)),
  botPlayers: BOT_ROSTER.map((bot, index) => ({
    ...bot,
    ready: index % 2 === 0,
    pingMs: 28 + index * 11,
  })),
  feed: [
    {
      id: `feed-${randomUUID()}`,
      type: 'system',
      text: `${regionName} realtime hub aktif.`,
      at: nowLabel(),
    },
  ],
  chat: [
    {
      id: `chat-${randomUUID()}`,
      author: 'Lobi Botu',
      text: `${regionName} kanalina hos geldiniz.`,
      at: nowLabel(),
    },
  ],
})

for (const regionName of REGION_POOL) {
  regionState.set(regionName, createRegionState(regionName))
}

const pushFeed = (regionName, type, text) => {
  const state = regionState.get(regionName)
  if (!state) {
    return
  }

  state.feed.unshift({
    id: `feed-${randomUUID()}`,
    type,
    text,
    at: nowLabel(),
  })
  state.feed = state.feed.slice(0, 24)
}

const pushChat = (regionName, author, text) => {
  const state = regionState.get(regionName)
  if (!state) {
    return
  }

  state.chat.unshift({
    id: `chat-${randomUUID()}`,
    author,
    text,
    at: nowLabel(),
  })
  state.chat = state.chat.slice(0, 24)
}

const serializeTenders = (regionName) => {
  const state = regionState.get(regionName)
  if (!state) {
    return []
  }

  return state.tenders.map((tender) => ({
    id: tender.id,
    title: tender.title,
    routeLabel: tender.routeLabel,
    mode: tender.mode,
    tons: tender.tons,
    minBid: tender.minBid,
    currentBid: tender.currentBid,
    currentLeader: tender.currentLeader,
    bidStep: tender.bidStep,
    closeAt: tender.closeAt,
    isOpen: tender.status === 'open',
  }))
}

const getRegionPlayers = (regionName) => {
  const state = regionState.get(regionName)
  if (!state) {
    return []
  }

  const humanPlayers = []
  for (const meta of clients.values()) {
    if (meta.region !== regionName) {
      continue
    }

    humanPlayers.push({
      id: meta.id,
      company: meta.company,
      captain: meta.captain,
      leagueMmr: meta.leagueMmr,
      pingMs: meta.pingMs,
      ready: meta.ready,
    })
  }

  return [...humanPlayers, ...state.botPlayers].sort((a, b) => b.leagueMmr - a.leagueMmr)
}

const sendWs = (socket, envelope) => {
  if (socket.readyState !== WebSocket.OPEN) {
    return
  }
  socket.send(JSON.stringify(envelope))
}

const broadcastRegion = (regionName, envelope) => {
  const payload = JSON.stringify(envelope)

  for (const [socket, meta] of clients.entries()) {
    if (meta.region === regionName && socket.readyState === WebSocket.OPEN) {
      socket.send(payload)
    }
  }

  for (const subscriber of sseSubscribers) {
    if (subscriber.region === regionName) {
      subscriber.res.write(`data: ${payload}\n\n`)
    }
  }
}

const broadcastSnapshotSlices = (regionName, options = {}) => {
  const { players = false, tenders = false, feed = false, chat = false } = options

  if (players) {
    broadcastRegion(regionName, { type: 'players', payload: getRegionPlayers(regionName) })
  }
  if (tenders) {
    broadcastRegion(regionName, { type: 'tenders', payload: serializeTenders(regionName) })
  }
  if (feed) {
    const state = regionState.get(regionName)
    broadcastRegion(regionName, { type: 'feed', payload: state ? state.feed : [] })
  }
  if (chat) {
    const state = regionState.get(regionName)
    broadcastRegion(regionName, { type: 'chat', payload: state ? state.chat : [] })
  }
}

const buildSnapshot = (regionName, clientId = '') => {
  const state = regionState.get(regionName)
  return {
    clientId,
    region: regionName,
    regions: REGION_POOL,
    latencyMs: 32,
    players: getRegionPlayers(regionName),
    tenders: serializeTenders(regionName),
    feed: state ? state.feed : [],
    chat: state ? state.chat : [],
  }
}

const placeBid = (regionName, actorName, tenderId, rawAmount) => {
  const state = regionState.get(regionName)
  if (!state) {
    return { ok: false, message: 'Bolge bulunamadi.' }
  }

  const tender = state.tenders.find((item) => item.id === tenderId)
  if (!tender) {
    return { ok: false, message: 'Ihale bulunamadi.' }
  }
  if (tender.status !== 'open') {
    return { ok: false, message: 'Ihale su anda kapali.' }
  }

  const minimumNextBid = tender.currentBid + tender.bidStep
  const targetBid = Number(rawAmount)
  const bidValue = Number.isFinite(targetBid) ? Math.max(targetBid, minimumNextBid) : minimumNextBid

  tender.currentBid = Math.round(bidValue)
  tender.currentLeader = actorName

  pushFeed(regionName, 'bid', `${tender.title}: ${actorName} ${money(tender.currentBid)} teklif verdi.`)
  broadcastSnapshotSlices(regionName, { tenders: true, feed: true })
  return { ok: true }
}

const applyAction = ({ actorId, actorCompany, actorCaptain, currentRegion }, actionType, payload = {}) => {
  const regionName = validRegion(payload.region ?? currentRegion)

  if (actionType === 'set_region') {
    return { ok: true, nextRegion: regionName }
  }

  if (actionType === 'chat_message') {
    const text = String(payload.text ?? '').trim().slice(0, 180)
    if (!text) {
      return { ok: false, message: 'Bos sohbet mesaji gonderilemez.' }
    }
    pushChat(regionName, actorCompany, text)
    pushFeed(regionName, 'chat', `${actorCompany} lobiye mesaj gonderdi.`)
    broadcastSnapshotSlices(regionName, { chat: true, feed: true })
    return { ok: true }
  }

  if (actionType === 'matchmaking_request') {
    pushFeed(regionName, 'lobby', `${actorCompany} eslesme istegi gonderdi.`)
    broadcastSnapshotSlices(regionName, { feed: true })
    return { ok: true }
  }

  if (actionType === 'place_bid') {
    return placeBid(regionName, actorCompany, payload.tenderId, payload.amount)
  }

  if (actionType === 'set_ready') {
    const meta = [...clients.values()].find((item) => item.id === actorId)
    if (meta) {
      meta.ready = Boolean(payload.ready)
      pushFeed(regionName, 'lobby', `${meta.company} hazir durumunu guncelledi.`)
      broadcastSnapshotSlices(regionName, { players: true, feed: true })
      return { ok: true }
    }

    return { ok: false, message: 'Canli oyuncu bulunamadi.' }
  }

  return { ok: false, message: 'Desteklenmeyen aksiyon tipi.' }
}

const app = express()
app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'realtime-server',
    connectedClients: clients.size,
    at: new Date().toISOString(),
  })
})

app.get('/api/snapshot', (req, res) => {
  const regionName = validRegion(String(req.query.region ?? REGION_POOL[0]))
  res.json(buildSnapshot(regionName))
})

app.post('/api/action', (req, res) => {
  const actionType = String(req.body?.type ?? '')
  const payload = req.body?.payload ?? {}
  const actorId = String(payload.clientId ?? `http-${randomUUID()}`)
  const actorCompany = String(payload.company ?? 'HTTP Trader').slice(0, 48)
  const actorCaptain = String(payload.captain ?? 'HTTP API').slice(0, 48)
  const currentRegion = validRegion(String(payload.region ?? REGION_POOL[0]))

  const result = applyAction({ actorId, actorCompany, actorCaptain, currentRegion }, actionType, payload)
  res.json(result)
})

app.get('/events', (req, res) => {
  const regionName = validRegion(String(req.query.region ?? REGION_POOL[0]))
  const subscriber = {
    id: `sse-${randomUUID()}`,
    region: regionName,
    res,
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  sseSubscribers.add(subscriber)
  res.write(`data: ${JSON.stringify({ type: 'snapshot', payload: buildSnapshot(regionName) })}\n\n`)

  req.on('close', () => {
    sseSubscribers.delete(subscriber)
  })
})

const httpServer = createServer(app)
const wsServer = new WebSocketServer({ server: httpServer, path: '/ws' })

wsServer.on('connection', (socket) => {
  const clientId = `ws-${randomUUID()}`
  const meta = {
    id: clientId,
    region: REGION_POOL[0],
    company: `Trader ${clientId.slice(-5)}`,
    captain: 'Baglanan Oyuncu',
    ready: false,
    pingMs: 34,
    leagueMmr: 1200 + Math.floor(Math.random() * 250),
  }

  clients.set(socket, meta)
  sendWs(socket, { type: 'snapshot', payload: buildSnapshot(meta.region, meta.id) })
  pushFeed(meta.region, 'system', `${meta.company} baglandi.`)
  broadcastSnapshotSlices(meta.region, { players: true, feed: true })

  socket.on('message', (rawData) => {
    let parsed
    try {
      parsed = JSON.parse(rawData.toString())
    } catch {
      sendWs(socket, { type: 'error', payload: { message: 'Gecersiz JSON paketi.' } })
      return
    }

    const actionType = String(parsed.type ?? '')
    const payload = parsed.payload ?? {}

    if (actionType === 'hello') {
      const previousRegion = meta.region
      meta.region = validRegion(String(payload.region ?? previousRegion))
      meta.company = String(payload.company ?? meta.company).trim().slice(0, 48) || meta.company
      meta.captain = String(payload.captain ?? meta.captain).trim().slice(0, 48) || meta.captain
      sendWs(socket, { type: 'snapshot', payload: buildSnapshot(meta.region, meta.id) })
      if (previousRegion !== meta.region) {
        broadcastSnapshotSlices(previousRegion, { players: true, feed: true })
      }
      pushFeed(meta.region, 'system', `${meta.company} lobiye katildi.`)
      broadcastSnapshotSlices(meta.region, { players: true, feed: true })
      return
    }

    const result = applyAction(
      {
        actorId: meta.id,
        actorCompany: meta.company,
        actorCaptain: meta.captain,
        currentRegion: meta.region,
      },
      actionType,
      payload,
    )

    if (result.nextRegion) {
      const oldRegion = meta.region
      meta.region = result.nextRegion
      sendWs(socket, { type: 'snapshot', payload: buildSnapshot(meta.region, meta.id) })
      if (oldRegion !== meta.region) {
        pushFeed(oldRegion, 'system', `${meta.company} bolge degistirdi.`)
        pushFeed(meta.region, 'system', `${meta.company} bu bolgeye baglandi.`)
        broadcastSnapshotSlices(oldRegion, { players: true, feed: true })
        broadcastSnapshotSlices(meta.region, { players: true, feed: true })
      }
      return
    }

    if (!result.ok && result.message) {
      sendWs(socket, { type: 'error', payload: { message: result.message } })
    }
  })

  socket.on('close', () => {
    const oldRegion = meta.region
    clients.delete(socket)
    pushFeed(oldRegion, 'system', `${meta.company} baglantiyi kapatti.`)
    broadcastSnapshotSlices(oldRegion, { players: true, feed: true })
  })
})

setInterval(() => {
  const now = Date.now()

  for (const [regionName, state] of regionState.entries()) {
    let tendersChanged = false
    let playersChanged = false

    for (const tender of state.tenders) {
      if (tender.status === 'open' && now >= tender.closeAt) {
        tender.status = 'closed'
        tender.reopenAt = now + 15000
        pushFeed(regionName, 'system', `${tender.title} kapandi. Kazanan: ${tender.currentLeader}.`)
        tendersChanged = true
        continue
      }

      if (tender.status === 'closed' && tender.reopenAt && now >= tender.reopenAt) {
        tender.status = 'open'
        tender.round += 1
        tender.currentBid = tender.minBid + tender.bidStep * tender.round
        tender.currentLeader = 'Sistem'
        tender.closeAt = now + tender.durationSec * 1000
        tender.reopenAt = null
        pushFeed(regionName, 'system', `${tender.title} yeni tur ile tekrar acildi.`)
        tendersChanged = true
        continue
      }

      if (tender.status === 'open' && Math.random() < 0.26) {
        const randomBot = state.botPlayers[Math.floor(Math.random() * state.botPlayers.length)]
        tender.currentBid += tender.bidStep
        tender.currentLeader = randomBot.company
        pushFeed(regionName, 'bid', `${tender.title}: ${randomBot.company} ${money(tender.currentBid)} teklif verdi.`)
        tendersChanged = true
      }
    }

    state.botPlayers = state.botPlayers.map((bot) => ({
      ...bot,
      ready: Math.random() > 0.35,
      pingMs: 25 + Math.floor(Math.random() * 95),
    }))
    playersChanged = true

    for (const meta of clients.values()) {
      if (meta.region === regionName) {
        meta.pingMs = 18 + Math.floor(Math.random() * 110)
        sendWs(
          [...clients.entries()].find((entry) => entry[1].id === meta.id)?.[0],
          { type: 'latency', payload: { ms: meta.pingMs } },
        )
      }
    }

    if (tendersChanged) {
      broadcastSnapshotSlices(regionName, { tenders: true, feed: true })
    } else {
      broadcastSnapshotSlices(regionName, { feed: true })
    }

    if (playersChanged) {
      broadcastSnapshotSlices(regionName, { players: true })
    }
  }
}, 2500)

httpServer.listen(PORT, () => {
  console.log(`Realtime server listening on http://localhost:${PORT}`)
})
