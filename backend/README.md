# Ticarium Multiplayer Backend (Demo)

Bu klasor, mobil demoya baglanabilen cevrimici cok oyunculu backend iskeletidir.

## Ozellikler

- Express REST API
- Socket.IO gercek zamanli oda senkronizasyonu
- Oda bazli oyuncu yonetimi
- Sevkiyat simulasyonu (risk, gelir, maliyet)
- Kriz sezonu guncelleme
- Kooperatif savunma fonu aktarimi
- Lider tablo ve oda durum snapshot'u

## Calistirma

```bash
cd backend
npm install
npm start
```

Sunucu varsayilan olarak `http://localhost:4000` adresinde calisir.

## Temel endpointler

- `GET /health`
- `GET /api/world/cities`
- `GET /api/world/routes`
- `GET /api/world/crises`
- `GET /api/rooms/:roomId/state`
- `POST /api/rooms/:roomId/join`
- `POST /api/rooms/:roomId/shipment`
- `POST /api/rooms/:roomId/transfer-defense-fund`
- `POST /api/rooms/:roomId/next-week`
- `POST /api/rooms/:roomId/crisis`

## Socket eventleri

Client -> Server:

- `dispatch-shipment`
- `transfer-defense-fund`
- `next-week`
- `set-crisis`

Server -> Client:

- `joined`
- `room-state`
- `server-error`

## Mobil taraf baglanti

Mobil uygulamada `Kriz` sekmesindeki **Cevrimici cok oyunculu baglanti** kartindan:

- Backend URL: `http://localhost:4000` (emulator degil fiziksel cihaz icin LAN IP kullan)
- Oda ID
- Oyuncu/sirket bilgisi

girip odaya baglanabilirsin.
