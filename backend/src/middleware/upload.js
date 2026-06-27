// upload.js — Konfigurasi Multer untuk menangani upload media (thumbnail artikel)
//
// Multer adalah middleware Express yang memproses request multipart/form-data,
// yaitu format yang dipakai untuk mengunggah berkas biner (gambar) bersama data teks.
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan folder uploads/ ada (dibuat otomatis jika belum)
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  // Nama file unik: timestamp + angka random, agar tidak saling menimpa
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({
  storage,
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
