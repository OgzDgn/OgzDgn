# Realtime Backend (Node + WebSocket + SSE)

Bu servis mobil oyun frontend'indeki cok oyunculu lobi ve canli ihale akisina veri saglar.

## Calistirma

```bash
npm install
npm run dev
```

Varsayilan adres: `http://localhost:8787`

## Uclar

- `GET /health`
- `GET /api/snapshot?region=Kuresel%20Lig`
- `POST /api/action`
- `GET /events?region=Kuresel%20Lig` (SSE)
- `WS /ws` (WebSocket)
