// upload.js — Konfigurasi Multer untuk menangani upload media (thumbnail artikel)
//
// PENTING: pakai memoryStorage (bukan diskStorage) — file diterima sebagai
// Buffer di memori (req.file.buffer), LALU dikirim ke Cloudinary oleh
// controller. Tidak ada lagi yang disimpan permanen ke disk server, karena
// disk hosting gratis (Render, dll) bersifat sementara dan terhapus saat
// redeploy/restart.
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // maksimal 5MB
  fileFilter: (req, file, cb) => {
    // Hanya terima file bertipe gambar (dari kamera atau upload manual)
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar yang diizinkan'), false);
    }
  },
});

module.exports = upload;
