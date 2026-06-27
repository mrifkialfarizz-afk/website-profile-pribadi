// config.js — Konfigurasi global aplikasi
// BASE_URL menunjuk ke origin backend Express.
//
// PENTING SAAT DEPLOY (Tugas 13): di localhost, backend jalan di
// http://localhost:5000. Setelah backend di-deploy (Render/Railway/dll),
// ganti GANTI_DENGAN_URL_BACKEND_DEPLOY di bawah dengan URL backend Anda,
// misalnya 'https://nama-app-anda.onrender.com'. Jangan ada trailing slash.
const DEPLOYED_BACKEND_URL = 'GANTI_DENGAN_URL_BACKEND_DEPLOY';

const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const BASE_URL = isLocalhost ? 'http://localhost:5000' : DEPLOYED_BACKEND_URL;

