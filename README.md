# Ticarium-Style Online Business Tycoon Backend

Bu repo, mobil istemcinin baglanacagi **online oyun sunucusu** temelini icerir.
Ilk iterasyonda su taleplerin altyapisi hazirlandi:

- Redis tabanli online state yonetimi
- Kayit / giris / beni hatirla (refresh token TTL ile)
- Hile koruma (nonce replay kontrolu, zaman damgasi kontrolu, action idempotency)
- Uretim tesisleri: tarim, hayvancilik, maden, sanayi
- Global market ve ihale sistemi
- Gercek dunya odakli harita modeli (ulkeler, sehirler, limanlar, rotalar)
- Bolgesel kriz ve ekonomik dalgalanma snapshot modeli

## Teknoloji

- Node.js + TypeScript
- Express API
- Redis (oyun state, auth session, market verisi)

## Kurulum

```bash
npm install
cp .env.example .env
```

Redis calistirmak icin:

```bash
docker compose up -d redis
```

Gelisim:

```bash
npm run dev
```

Derleme:

```bash
npm run build
npm start
```

## Ortam Degiskenleri

`.env.example` dosyasindaki tum alanlar doldurulmalidir:

- `REDIS_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- token TTL ayarlari
- `CLIENT_CLOCK_SKEW_MS`

## API Ozeti

### Health
- `GET /health`

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

### Dunya
- `GET /world/map`

### Oyun
- `GET /game/profile`
- `POST /game/facilities` (auth + anti-cheat)
- `POST /game/produce` (auth + anti-cheat)

### Market
- `GET /market/global/sales`
- `POST /market/global/sell` (auth + anti-cheat)
- `GET /market/auctions`
- `POST /market/auctions` (auth + anti-cheat)
- `POST /market/auctions/:auctionId/bid` (auth + anti-cheat)
- `POST /market/auctions/:auctionId/settle` (auth)

## Anti-Cheat Headerlari (state degistiren endpointler)

Asagidaki headerlar zorunludur:

- `Authorization: Bearer <accessToken>`
- `x-client-ts: <unix-ms>`
- `x-client-nonce: <unique-random-string>`

Opsiyonel:

- Body icinde `clientActionId` (idempotency icin onerilir)

## Not

Bu surum backend MVP altyapisidir. Mobil istemci, WebSocket event sistemi, zamanlanmis uretim kuyrugu ve daha derin ekonomi modellemesi sonraki iterasyonlarda eklenebilir.
