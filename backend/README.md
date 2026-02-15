# Ticarium Multiplayer Backend (PostgreSQL + Auth + Anti-Cheat)

Bu backend artik:

- PostgreSQL ile kalici veri saklar
- JWT kimlik dogrulama sunar
- Hesap bazli sezon ilerlemesini tutar
- Socket.IO ile gercek zamanli oda senkronizasyonu yapar
- Anti-hile puanlama ve ihlal kaydi tutar

## Ozellikler

- Kalici tablolar: users, seasons, rooms, player_season_states, room_events, anti_cheat_flags
- Auth endpointleri: register / login / me
- Sezon endpointleri: current, leaderboard, admin create/activate, advance-week
- Oda endpointleri: state, join, shipment, transfer-defense-fund, next-week, crisis
- Socket eventleri: `dispatch-shipment`, `transfer-defense-fund`, `next-week`, `set-crisis`
- Anti-hile:
  - action cooldown
  - server-authoritative ekonomi hesaplamasi
  - supheli islem loglama + anti_cheat_score artisi
  - kritik puanda hesap kilitleme

## Kurulum

### 1) Ortam degiskenleri

`.env.example` dosyasini kopyala:

```bash
cd backend
cp .env.example .env
```

`DATABASE_URL` ve `JWT_SECRET` degerlerini guncelle.

### 2) PostgreSQL migration

```bash
cd backend
npm install
npm run migrate
```

### 3) Sunucuyu baslat

```bash
cd backend
npm start
```

Sunucu varsayilan olarak `http://localhost:4000` adresinde calisir.

## Auth akisi (ornek)

### Register

`POST /api/auth/register`

```json
{
  "email": "player@example.com",
  "password": "VeryStrongPass123",
  "displayName": "Oyuncu 1",
  "companyName": "Trade Nova"
}
```

### Login

`POST /api/auth/login` ile `token` al.

### Protected endpointler

`Authorization: Bearer <token>` header'i gonder.

## Sezon notlari

- Aktif sezon yoksa backend otomatik bir aktif sezon olusturur.
- Her sevkiyat hafta ilerletir.
- `max_weeks` dolunca sezon `completed` olur.
- Yeni sezon olusturma/aktif etme endpointleri admin yetkisi ister.

## Admin hesabi

Register isteginde `adminKey` gonderip bunu `.env` icindeki `ADMIN_BOOTSTRAP_KEY` ile eslestirirsen rol `admin` olur.

## Socket baglanti

Socket auth alaninda JWT token gonder:

```js
io("http://localhost:4000", {
  auth: {
    token: "<jwt>",
    roomId: "global-room",
    playerName: "Oyuncu 1",
    company: "Trade Nova"
  }
})
```
