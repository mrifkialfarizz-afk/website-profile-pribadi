// cloudinary.js — Konfigurasi Cloudinary (penyimpanan foto permanen)
//
// KENAPA PERLU INI: hosting backend gratis (Render, dll) memakai disk
// SEMENTARA (ephemeral). Setiap kali backend redeploy/restart, semua file
// yang disimpan langsung di folder `uploads/` akan TERHAPUS, padahal data
// artikel di database (judul, isi) tetap aman. Makanya foto thumbnail
// sekarang disimpan di Cloudinary (layanan cloud storage gratis untuk
// gambar), dan yang disimpan ke database hanya URL-nya saja.
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
