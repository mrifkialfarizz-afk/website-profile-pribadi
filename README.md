# Tugas Pertemuan 12 — Integrasi Halaman Profile Pribadi dengan Map Location
### pada Website Profil Pribadi (SPA + MVP)

Proyek ini melanjutkan Tugas 11 (Transisi, Animasi & Media) dengan menambahkan:

- **Geolocation API** — meminta & membaca koordinat lokasi pengguna secara real-time
- **Map Location (Leaflet.js + OpenStreetMap)** — peta interaktif yang menampilkan
  domisili saya dan lokasi pengguna saat ini secara berdampingan
- **Reverse Geocoding** — koordinat diterjemahkan ke nama tempat lewat Nominatim
- *Nilai plus:* **Service Worker API** — App Shell caching agar shell aplikasi tetap
  bisa dimuat saat koneksi terputus
- *Nilai plus:* **Web Push Notification (lokal)** — saat lokasi pengguna berhasil
  ditemukan, notifikasi ditampilkan lewat `ServiceWorkerRegistration.showNotification()`

> Fitur dari Tugas 11 (View Transition, WAAPI, Media Stream/Canvas, upload thumbnail,
> SPA + MVP) tetap dipertahankan penuh.

## Struktur Folder

```
tugas11/
├── database/schema.sql
├── backend/
│   ├── server.js                  ← + static /uploads
│   ├── uploads/                   ← tempat file thumbnail tersimpan
│   └── src/
│       ├── config/db.js
│       ├── middleware/upload.js   ← konfigurasi Multer
│       ├── controllers/articleController.js
│       └── routes/articleRoutes.js
└── frontend/                      ← SPA
    ├── index.html                 ← + CDN Leaflet (Map Location)
    ├── sw.js                      ← BARU: Service Worker (cache + push notification)
    └── src/
        ├── main.js, app.js, router.js, routes.js, config.js
        ├── errors.js
        ├── data/
        │   ├── article-api.js     ← MODEL: fetch wrapper (+ FormData upload)
        │   └── article-model.js   ← MODEL: domain methods
        ├── ui/dom.js               (toast WAAPI, skeleton, format, escape)
        ├── utils/
        │   ├── debounce.js
        │   ├── animations.js       ← WAAPI: popIn, cardEnter, fadeIn, toast slide
        │   ├── camera.js           ← Media Stream + Canvas + Blob
        │   ├── geolocation.js      ← BARU: Geolocation API + reverse geocoding
        │   ├── map.js              ← BARU: pembungkus Leaflet.js (Map Location)
        │   └── notifications.js   ← BARU: Notification API + Service Worker messaging
        ├── pages/
        │   ├── home/    (home-page.js = VIEW + section #location, home-presenter.js = PRESENTER)
        │   ├── detail/  (detail-page.js, detail-presenter.js)
        │   └── admin/   (admin-page.js, admin-presenter.js)
        └── styles/
            ├── main.css            ← + style .map-container, .location-*
            └── transitions.css     ← View Transition + Shared Element + Reduced Motion
```

## Cara Menjalankan

1. **Database** — jalankan XAMPP (Apache+MySQL), import `database/schema.sql` ke phpMyAdmin
   (lewati langkah ini jika database `profile_cms` sudah ada dari Tugas 10).
2. **Backend**:
   ```bash
   cd backend
   npm install
   # copy .env.example jadi .env, sesuaikan kredensial MySQL jika perlu
   npm start
   ```
3. **Frontend** — klik kanan `frontend/index.html` → **Open with Live Server**.
   Karena ini SPA, **cukup buka `index.html` satu kali** — navigasi ke
   Beranda/Admin/Detail semua terjadi lewat hash (`#/`, `#/admin`, `#/article/:id`)
   tanpa reload halaman.
4. **Map Location** — di Beranda, scroll ke bagian **"Lokasi"**, lalu klik
   **"📍 Tampilkan Lokasi Saya"**. Browser akan meminta izin lokasi (izinkan),
   lalu marker lokasi Anda akan muncul di peta yang sama dengan domisili saya.
   Jika juga mengizinkan notifikasi, sebuah notifikasi "Lokasi ditemukan" akan tampil.

## Pemetaan Kriteria Tugas

| Kriteria | Implementasi |
|---|---|
| Format `.zip` (Frontend, Backend, Database SQL) | Folder `frontend/`, `backend/`, `database/` dalam satu zip ini |
| Integrasi Halaman Profile Pribadi dengan Map Location | Section `#location` di `home-page.js` + `utils/map.js` (Leaflet) + `utils/geolocation.js` |
| Recording demo: map location & (jika ada) push notification | Lihat skenario di `PANDUAN_IMPLEMENTASI.md` |
| *Nilai plus:* Service Worker API & Web Push Notification | `frontend/sw.js` (cache App Shell + `showNotification`) + `utils/notifications.js` |
| *Nilai plus (Tugas 11):* SPA & MVP | Hash router (`router.js`) + pemisahan View/Presenter/Model di setiap halaman |

## Catatan Penting

- **Kamera & Lokasi butuh Secure Context.** Live Server berjalan di `http://127.0.0.1:5500`
  yang dianggap localhost oleh browser, jadi kamera & geolocation tetap berfungsi. Jika
  diakses lewat IP lain (mis. `192.168.x.x`) atau `file://`, browser akan menolak.
- Thumbnail yang diupload disimpan di `backend/uploads/` dan disajikan lewat
  `http://localhost:5000/uploads/<nama-file>`.
- Ganti placeholder profil (nama, bio, skill) di `frontend/src/pages/home/home-page.js`
  dan koordinat domisili (`HOME_LOCATION`) di `frontend/src/utils/map.js` sebelum dikumpulkan.
- **Tentang Web Push:** notifikasi yang diimplementasikan adalah notifikasi lokal
  (dipicu dari halaman lewat Service Worker, bukan dari server). Web Push *end-to-end*
  yang sesungguhnya butuh server push (VAPID key + endpoint subscription tersimpan di
  database) yang belum ada di backend ini. Event `push` di `sw.js` sudah disiapkan
  dan langsung bisa dipakai begitu server push ditambahkan.
