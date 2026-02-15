# Ticarium Global Trade - Mobil Frontend Demo

Bu klasor, istedigin "dunya capinda mobil ticaret oyunu" icin hazirlanan Expo tabanli bir **frontend demo** uygulamasidir.

## Demo icerigi

- Gercek sehirler: New York, Shanghai, Istanbul, Dubai, Hamburg, Tokyo
- Gercek limanlar ve ticaret rotalari (kara/deniz/hava)
- Zor ekonomi: enflasyon, doviz, yakit, kredi-borc, yatirimci baskisi, iflas riski
- Risk sistemi: korsan, sinir krizi, hava yasaklari, liman grevi, vergi cezasi
- Kooperatif mekanigi: ortak filo, savunma fonu, gelir paylasimi, global siralama
- Kriz sezonu: savas, petrol krizi, pandemi, liman grevi, sinir krizi

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

## Not

Bu repo frontend demo odaklidir; cok oyunculu altyapi, kalici hesap sistemi ve gercek zamanli sunucu mantigi sonraki adimda backend ile tamamlanir.
