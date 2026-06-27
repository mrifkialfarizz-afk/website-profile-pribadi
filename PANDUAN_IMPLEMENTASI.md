# Panduan Implementasi — Tugas Pertemuan 11
### Transisi, Animasi & Media pada Website Profil Pribadi (SPA + MVP)

Panduan ini lanjutan dari panduan Tugas 10. Ikuti berurutan — sama seperti
sebelumnya: **Database → Backend → Frontend**, baru uji fitur satu per satu.

---

## TAHAP 0 — Yang Berubah dari Tugas 10

| Sebelumnya (Tugas 10) | Sekarang (Tugas 11) |
|---|---|
| `index.html` & `admin.html` terpisah (MPA) | Satu `index.html`, navigasi lewat hash router (SPA) |
| `main.js` / `admin.js` flat | Pola **MVP**: tiap halaman punya View (`*-page.js`) + Presenter (`*-presenter.js`) |
| Tidak ada animasi/transisi | View Transition API, Shared Element, WAAPI |
| Thumbnail hanya field URL manual | Thumbnail diambil dari **kamera** atau **upload file**, benar-benar tersimpan di server |

Database tidak berubah skema (`thumbnail_url` sudah ada sejak Tugas 10).

---

## TAHAP 1 — Backend

```bash
cd backend
npm install
npm start
```

Harus muncul:
```
Server berjalan di http://localhost:5000
Media diakses lewat   http://localhost:5000/uploads/<nama-file>
```

### Tes backend dengan Thunder Client SEBELUM ke frontend

| Tes | Cara | Hasil |
|---|---|---|
| Endpoint biasa masih jalan | `GET /api/articles` | Data artikel dari Tugas 10 (kalau DB sama) |
| Upload artikel + gambar | `POST /api/articles`, pilih body **Form** (bukan JSON), isi field `title`, `content`, lalu tambah field bertipe **File** bernama `thumbnail` | Respons `data.thumbnail_url` berisi `/uploads/xxxx.png` |
| Cek file tersimpan | Lihat folder `backend/uploads/` di File Explorer | Ada file gambar baru |
| Akses gambar langsung | Buka `http://localhost:5000/uploads/<nama-file>` di browser | Gambar tampil |

✅ Kalau ke-4 nya berhasil, integrasi Multer sudah benar — lanjut ke frontend.

---

## TAHAP 2 — Jalankan Frontend (SPA)

1. Klik kanan `frontend/index.html` → **Open with Live Server**.
2. **Cukup buka sekali.** Semua halaman (Beranda, Admin, Detail) sekarang
   dirender oleh JavaScript yang sama — perhatikan URL berubah jadi
   `.../index.html#/`, `.../index.html#/admin`, dst., **tanpa reload**.

✅ Checkpoint: klik link "Admin CMS" di navbar → halaman berganti instan
(tanpa flicker putih reload browser) ke dashboard CMS.

> ⚠️ Kamera butuh **Secure Context**. Live Server di `127.0.0.1:5500` aman
> (dianggap localhost), tapi jangan buka file lewat `file://` langsung.

---

## TAHAP 3 — Uji Transisi & Animasi

| # | Yang diuji | Cara | Yang harus terlihat |
|---|---|---|---|
| 1 | View Transition antar halaman | Klik nav Beranda ↔ Admin CMS berulang | Efek **cross-fade** halus, bukan pergantian instan kaku |
| 2 | Shared Element Transition | Di Beranda, klik kartu artikel yang **punya thumbnail** | Gambar thumbnail "terbang" membesar jadi gambar besar di halaman Detail. Klik "← Kembali" → mengecil kembali |
| 3 | Reduced motion | F12 → `Ctrl+Shift+P` → ketik "rendering" → tab **Rendering** → centang **Emulate CSS prefers-reduced-motion** | Navigasi jadi instan tanpa fade/morph; animasi kartu & tombol juga tidak jalan |
| 4 | Animasi kartu (WAAPI) | Refresh Beranda | Kartu artikel muncul satu-per-satu dari bawah (stagger), bukan muncul serentak |
| 5 | Animasi tombol (popIn) | Klik tombol apa pun di Admin (Edit, Buka Kamera, dst) | Tombol sedikit mengecil lalu kembali normal saat diklik |
| 6 | Toast WAAPI | Lakukan aksi apa pun yang memicu toast (simpan/hapus) | Toast slide masuk dari bawah, dan slide keluar ke bawah sebelum hilang |

---

## TAHAP 4 — Uji Media (Kamera, Canvas, Upload)

Buka halaman **Admin CMS** (`#/admin`):

| # | Langkah | Hasil yang diharapkan |
|---|---|---|
| 1 | Klik **"📷 Ambil dari Kamera"** di form Tambah Artikel | Browser minta izin kamera → klik **Allow** → live preview kamera muncul |
| 2 | Klik **🔄** (ganti kamera) | Kamera berganti depan/belakang (jika perangkat punya 2 kamera) |
| 3 | Klik **⚫** (grayscale), lalu **📷 Ambil Foto** | Hasil foto berwarna abu-abu (filter diterapkan) |
| 4 | Klik **✓ Gunakan Foto Ini** | Preview thumbnail di form terisi, panel kamera tertutup, **lampu kamera mati** |
| 5 | Isi judul + isi artikel, klik **Simpan** | Artikel tersimpan; cek di phpMyAdmin tabel `articles` → kolom `thumbnail_url` berisi path `/uploads/...` |
| 6 | Cek folder `backend/uploads/` | Ada file gambar baru sesuai waktu Anda menyimpan |
| 7 | Buka artikel itu di Beranda → klik kartunya | Halaman Detail menunjukkan gambar yang sama |
| 8 | Di halaman Detail, klik **⬇ Unduh Gambar** | File gambar terdownload ke folder Downloads perangkat Anda |
| 9 | Sebagai alternatif kamera: klik **"📁 Upload File"** lalu pilih gambar dari komputer | Preview thumbnail terisi dari file yang dipilih (tanpa kamera) |

### Uji Cleanup Lifecycle (Praktikum 9)
1. Buka panel kamera di Admin (lampu kamera menyala).
2. Klik nav **Beranda** untuk pindah halaman **tanpa menutup kamera secara manual**.
3. **Lampu kamera harus mati otomatis** begitu halaman berganti.
4. Cek Console (F12) → muncul log `[AdminPage] Stream kamera dihentikan (beforeLeave)`.

---

## TAHAP 5 — Troubleshooting Khusus Tugas 11

| Gejala | Sebab | Solusi |
|---|---|---|
| Kamera tidak muncul, error `NotAllowedError` | Izin kamera ditolak/diblokir | Klik ikon kamera/gembok di address bar → ubah izin jadi Allow → klik "Coba Lagi" |
| Error kamera saat dibuka dari `file://` | Bukan secure context | Selalu pakai Live Server (`http://127.0.0.1:5500`), jangan klik 2x file HTML |
| Upload gagal, error 500 dari Multer | File terlalu besar (>5MB) atau bukan gambar | Pilih file gambar lebih kecil, atau ubah `limits.fileSize` di `upload.js` |
| Thumbnail tidak tampil di kartu/detail (gambar pecah) | URL salah / backend mati | Pastikan backend jalan di port 5000; cek `BASE_URL` di `frontend/src/config.js` cocok |
| Transisi halaman tidak terlihat (langsung ganti) | Browser tidak mendukung View Transition API, atau Reduce Motion aktif | Pakai Chrome/Edge versi terbaru; cek emulasi Reduce Motion sudah dimatikan |
| Klik kartu artikel tidak pindah halaman | Event listener belum terpasang (HTML salah/`data-id` hilang) | Cek Console untuk error, pastikan `home-page.js` tidak diedit strukturnya |
| Setelah edit artikel, gambar lama tidak hilang dari folder `uploads/` | (Ini sudah ditangani otomatis) | Cek `articleController.js` bagian `update`/`remove` — ada `fs.unlink` untuk hapus file lama |

---

## TAHAP 6 — Skenario Recording Demo

Sesuai kriteria soal: **"gambaran fungsi transisi & upload media"**. Urutan yang disarankan:

1. **Buka Beranda** → tunjukkan animasi kartu muncul stagger saat refresh.
2. **Klik kartu artikel** yang punya gambar → tunjukkan efek shared element transition (gambar "terbang").
3. **Klik "← Kembali"** → tunjukkan transisi sebaliknya.
4. **Navigasi ke Admin CMS** lewat navbar → tunjukkan transisi cross-fade antar halaman.
5. **Buka kamera** di form Tambah Artikel → ambil foto (tunjukkan toggle grayscale) → gunakan foto itu.
6. **Isi & Simpan artikel** → tunjukkan toast muncul dengan animasi slide.
7. **Buka phpMyAdmin** → tunjukkan `thumbnail_url` artikel baru sudah tersimpan, dan **buka folder `backend/uploads/`** untuk menunjukkan file fisiknya ada.
8. **Kembali ke Beranda**, buka artikel itu → **Unduh Gambar** → tunjukkan file masuk ke Downloads.
9. *(Opsional, nilai plus)* Aktifkan emulasi `prefers-reduced-motion` di DevTools → tunjukkan semua animasi berhenti.
10. *(Opsional)* Tunjukkan Console saat pindah dari halaman Admin → log cleanup kamera muncul.

Narasikan tiap langkah seperti pada recording Tugas 10.

---

## TAHAP 7 — Peta Konsep → Kode (Untuk Pemahaman & Tanya-Jawab)

| Konsep | File | Fungsi/Bagian |
|---|---|---|
| SPA (hash routing) | `router.js`, `routes.js`, `app.js` | Ganti konten tanpa reload browser |
| Pola MVP | `*-page.js` (View), `*-presenter.js` (Presenter), `article-model.js` (Model) | Pemisahan tampilan, orkestrasi, dan data |
| View Transition API | `router.js` method `_renderPage()` | `document.startViewTransition(updateDOM)` |
| Shared Element Transition | `home-page.js`, `detail-page.js` | `style="view-transition-name: article-img-${id}"` |
| prefers-reduced-motion | `transitions.css`, `animations.js` | `@media` query + `window.matchMedia(...)` |
| Web Animations API | `animations.js` | `el.animate(keyframes, options)` |
| Media Stream API | `camera.js` → `startCamera` | `navigator.mediaDevices.getUserMedia(...)` |
| Canvas + filter | `camera.js` → `captureFrame`, `applyGrayscale` | `drawImage()`, `getImageData()/putImageData()` |
| Blob & Download | `camera.js` → `canvasToBlob`, `downloadBlob` | `canvas.toBlob()`, `URL.createObjectURL()` |
| Upload ke backend | `article-api.js` → `buildFormData` ↔ `upload.js` (Multer) | `FormData` + `multer.single('thumbnail')` |
| Cleanup lifecycle | `admin-page.js` → `beforeLeave()` | `stopCamera(this._stream)` |

---

## TAHAP 8 — Checklist Akhir

- [ ] Navigasi antar halaman pakai View Transition (terasa cross-fade)
- [ ] Shared element transition jalan saat klik artikel (yang ada gambarnya)
- [ ] prefers-reduced-motion sudah diuji dan mematikan animasi
- [ ] Kartu artikel muncul stagger animation di Beranda
- [ ] Kamera bisa diakses, capture foto, filter grayscale berfungsi
- [ ] Foto kamera ATAU file upload berhasil tersimpan ke `backend/uploads/` dan `thumbnail_url` di database
- [ ] Tombol Unduh Gambar di halaman Detail berhasil mendownload file
- [ ] Kamera otomatis mati saat pindah halaman dari Admin (cek Console)
- [ ] Placeholder profil (nama, bio, skill) sudah diganti data asli
- [ ] Folder `frontend/`, `backend/`, `database/` lengkap dalam satu `.zip`
- [ ] Video recording sudah merekam transisi + upload media sesuai Tahap 6

Kalau semua ✅, tugas siap dikumpulkan.
