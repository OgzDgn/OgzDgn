# Ticarium Global Trade - Mobil Frontend Demo

Bu klasor, istedigin "dunya capinda mobil ticaret oyunu" icin hazirlanan Expo tabanli bir **frontend demo** uygulamasidir.

## Demo icerigi

- Gercek sehirler: New York, Shanghai, Istanbul, Dubai, Hamburg, Tokyo
- Gercek limanlar ve ticaret rotalari (kara/deniz/hava)
- Harita gorunumu: marker + rota polyline + rota risk analizi
- Zor ekonomi: enflasyon, doviz, yakit, kredi-borc, yatirimci baskisi, iflas riski
- Risk sistemi: korsan, sinir krizi, hava yasaklari, liman grevi, vergi cezasi
- Kooperatif mekanigi: ortak filo, savunma fonu, gelir paylasimi, global siralama
- Kriz sezonu: savas, petrol krizi, pandemi, liman grevi, sinir krizi
- Cevrimici panel: hesap olusturma/giris (JWT), oda baglantisi, online oyuncu listesi, online lider tablo

## Lokal calistirma

```bash
cd mobile-demo
npm install
npm run start
```

## Telefonda deneme (Expo Go)

1. Telefonuna **Expo Go** uygulamasini kur (iOS/Android).
2. Bilgisayarda:

   ```bash
   cd mobile-demo
   npm run start
   ```

3. Terminalde/arayuzde cikan QR kodu Expo Go ile tara.
4. Uygulama telefonda acilir.

### Ag sorunu olursa (onerilen)

```bash
cd mobile-demo
npx expo start --tunnel
```

`--tunnel` ozellikle farkli ag/VPN durumlarinda daha stabil baglanti saglar.

## Cevrimici backend ile calistirma

1. Ayrica backend'i ac:

```bash
cd backend
npm install
npm run migrate
npm start
```

2. Mobil uygulamada `Kriz` sekmesine gir.
3. "Cevrimici cok oyunculu baglanti" kartinda:
   - E-posta + sifre ile hesap olustur veya giris yap
   - Backend URL
   - Oda ID
   - Oyuncu / Sirket
     alanlarini doldurup odaya baglan.

> Fiziksel telefondan baglaniyorsan `localhost` yerine bilgisayarinin LAN IP adresini kullan.

## Not

Bu yapi artik PostgreSQL + JWT + anti-cheat temeli icerir; production seviyesinde yine de cache, gozlemlenebilirlik, secret yonetimi ve gelismis anti-fraud kurallari eklenmelidir.
