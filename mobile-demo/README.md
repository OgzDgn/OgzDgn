# Kuresel Ticaret Oyunu - Mobil Frontend Demo

Bu proje, "Ticarium Online" benzeri mobil odakli bir ticaret-strateji oyunu on yuz demosudur.
Frontend React + Vite ile hazirlanmistir.

## Demo Icerigi

- Gercek sehirler ve limanlar:
  - New York
  - Shanghai
  - Istanbul
  - Dubai
  - Hamburg
  - Tokyo
- Gercekci ticaret modlari:
  - Kara Ticareti (tir, tren, soguk zincir, kara tankeri)
  - Deniz Ticareti (konteyner, tanker, LNG, eskortlu gemi)
  - Hava Ticareti (kargo ucagi, hizli jet, degerli esya tasimasi)
- Zor ekonomi sistemi:
  - Enflasyon
  - Kur dalgalanmasi
  - Kredi / faiz
  - Yatirimci baskisi
  - Iflas riski
  - Sigorta, depo, personel, bakim maliyetleri
- Kriz sezonlari:
  - Petrol krizi
  - Bolgesel savas
  - Kuresel pandemi
  - Finans cokusu
- Koop sirket birligi paneli:
  - Ortak filo
  - Ortak depo
  - Gelir paylasim zinciri
  - Ortak savunma ve ihale
- Finans ve rekabet:
  - Mini borsa paneli
  - Kredi alma / borc odeme
  - Kuresel lig ve rakip tablo

## Kurulum

```bash
npm install
```

## Gercek Zamanli Arka Uc (Node + WebSocket + SSE)

Bu repo icinde `realtime-server` klasoru bulunur. Canli cok oyunculu lobi ve ihale
akisi bu sunucuya baglanir.

Backend kurulum:

```bash
cd ../realtime-server
npm install
npm run dev
```

Varsayilan adres:

```text
http://localhost:8787
```

Frontend tarafinda bu adresi su sekillerde kullanabilirsin:

- Lobi panelindeki **Gercek Zamanli Backend URL** alanina yazarak
- veya `.env` dosyasina:

```bash
VITE_REALTIME_BACKEND_URL=http://localhost:8787
```

## Gelistirme Sunucusu

```bash
npm run dev
```

## Mobil Telefonda Deneme (Ayni Ag)

1. Bilgisayarda su komutu calistir:

   ```bash
   npm run dev -- --host 0.0.0.0 --port 4173
   ```

2. Terminalde cikan yerel IP adresini not et (ornegin `192.168.1.24`).
3. Telefonu ayni Wi-Fi agina bagla.
4. Telefonda su adrese git:

   ```text
   http://192.168.1.24:4173
   ```

5. Ekrani "Ana Ekrana Ekle" ile PWA benzeri kisayol olarak kullanabilirsin.

## Build

```bash
npm run build
npm run preview
```

## Canli Demo ve Indirme

- Canli demo (RawGitHack CDN):  
  `https://raw.githack.com/OgzDgn/OgzDgn/cursor/mobil-k-resel-ticaret-oyunu-55de/online-demo/index.html`
- ZIP indirme (bu branch):  
  `https://github.com/OgzDgn/OgzDgn/archive/refs/heads/cursor/mobil-k-resel-ticaret-oyunu-55de.zip`
