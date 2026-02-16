# Ticarium Tarzi Online Ticaret Oyunu - Vizyon Dokumani

Bu proje, mobil istemci + online oyun sunucusu modeliyle calisir.

## Hedef Sistemler

1. **Uretim Tesisleri**
   - Tarim: bugday, pamuk
   - Hayvancilik: sut, et
   - Maden: demir cevheri, komur
   - Sanayi: ham urunlerden katma degerli urunler (celik, tekstil, un)

2. **Ticaret**
   - Global pazar (anlik satis)
   - Ihale sistemi (acik arttirma)
   - Vergi, komisyon, dengeleme parametreleri

3. **Dunya Simulasyonu**
   - Gercek ulkeler, sehirler, limanlar
   - Gercek ticaret rotalarina dayali lojistik model
   - Bolgesel krizler ve ekonomik dalgalanmalar

4. **Online ve Guvenlik**
   - Redis tabanli online state
   - Kayit / giris / beni hatirla
   - Hile koruma: nonce replay korumasi, action-id idempotency, saat drift kontrolu

## Simdiki Iterasyon (v0.1.0)

- Redis-backed API temeli
- Auth + remember me + refresh token rotasyonu
- Facility kurma + uretim + envanter
- Global satis + ihale olusturma / teklif / settle
- Dunya haritasi verisi + kriz + ekonomi carpani snapshot

## Sonraki Iterasyonlar

1. WebSocket tabanli canli pazar ve ihale event sistemi
2. Sunucu tarafli zamanlanmis uretim kuyrugu (instant yerine sureli)
3. Anti-cheat skorlamasi + anomali tespiti
4. Gercek harita katmani (Mapbox/Leaflet) ve rota optimizasyonu
5. Clan/sirket sistemi, lojistik filolari, gümrük/vergilendirme derinlestirme
