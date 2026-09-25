# Bugün Mutlaka

Günlük yapılacaklar uygulaması: **Bugün mutlaka / Bu hafta / Bir gün** bölümleri, kilitli
kritik görevler, sabah onay ekranı, alt görevler, yüzdelik ilerleme, tekrarlayan görevler ve geçmiş.

**Adres:** https://rumred72.github.io/bugun-mutlaka/

Tek başına çalışan bir web uygulamasıdır (PWA). Sunucu gerekmez; veriler cihazda saklanır,
internet olmadan da çalışır. İstenirse Google Drive üzerinden cihazlar arasında eşitlenir.

## Telefona kurmak
- **iPhone:** Safari'de aç → Paylaş → **Ana Ekrana Ekle**
- **Android:** Chrome'da aç → ⋮ → **Ana ekrana ekle** / **Uygulamayı yükle**
- **Bilgisayar (Chrome/Edge):** adres çubuğundaki "yükle" simgesi

## Claude'daki eski listeyi taşımak
1. Claude'daki uygulamada Ayarlar → **Yedeği indir**
2. Bu uygulamada Ayarlar → **Yedekten geri yükle** → dosyayı seç

## Google Drive eşitlemesi (isteğe bağlı, bir kerelik ~10 dk)
Veriler Drive'ında uygulamaya özel gizli bir klasörde (`appDataFolder`) tutulur;
uygulama Drive'ındaki başka hiçbir dosyayı göremez.

1. https://console.cloud.google.com adresine Google hesabınla gir, üstten **Yeni proje** oluştur (ad: `bugun-mutlaka`).
2. **API'ler ve Hizmetler → Kitaplık** → "Google Drive API" → **Etkinleştir**.
3. **API'ler ve Hizmetler → OAuth izin ekranı** (Google Auth Platform):
   - Kullanıcı türü: **Harici (External)**, uygulama adı: `Bugün Mutlaka`, e-posta: kendi adresin.
   - **Kapsamlar / Data access** kısmına `.../auth/drive.appdata` ekle.
   - **Test kullanıcıları / Audience** kısmına kendi Gmail adresini ekle.
4. **API'ler ve Hizmetler → Kimlik bilgileri → Kimlik bilgisi oluştur → OAuth istemci kimliği**:
   - Uygulama türü: **Web uygulaması**
   - **Yetkili JavaScript kaynakları:** `https://rumred72.github.io`
   - **Yetkili yönlendirme URI'leri:** `https://rumred72.github.io/bugun-mutlaka/` (sondaki `/` dahil)
     (sonunda `/` ve klasör yolu olmadan)
   - Oluştur → çıkan **Client ID**'yi kopyala (`….apps.googleusercontent.com`).
5. Uygulamada Ayarlar → **Google Drive ile eşitleme** → Client ID'yi yapıştır → **Drive'ı bağla**.
   Google "Bu uygulama doğrulanmadı" derse **Gelişmiş → Devam et** (uygulama senin, sorun yok).
6. Diğer cihaz için: Ayarlar → **Diğer cihaz için link** → linki telefonda aç → **Drive'a bağlan**. İki cihaz aynı listeyi görür.

Google oturumu güvenlik gereği saatte bir yenilenir: üstteki **"Drive'a bağlan"** yazısına
dokunman yeterli. Bağlantı olmasa da uygulama çalışır, değişiklikler sonraki eşitlemede gider.

## Dosyalar
- `index.html` – uygulamanın tamamı
- `sw.js` – internetsiz çalışma (önbellek)
- `manifest.webmanifest`, `icons/` – telefona kurulum
- `vendor/Sortable.min.js` – sürükle-bırak (SortableJS 1.15.2, MIT)
- `vendor/html2canvas.min.js` – raporu görsele çevirme (html2canvas 1.4.1, MIT)
