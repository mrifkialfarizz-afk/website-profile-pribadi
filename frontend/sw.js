// sw.js — Service Worker (NILAI PLUS: Service Worker API & Web Push Notification)
//
// Tanggung jawab:
// 1. Cache shell aplikasi (App Shell) agar bisa dimuat ulang saat offline.
// 2. Menerima event 'push' dari server lalu menampilkan notifikasi (Web Push).
// 3. Menampilkan notifikasi lokal saat menerima pesan dari halaman (postMessage),
//    dipakai di fitur Map Location: "Lokasi Anda berhasil ditemukan".
//
// Catatan jujur: Web Push end-to-end yang utuh membutuhkan server push (VAPID key
// + endpoint subscription) yang disimpan ke database. Bagian itu tidak diaktifkan
// di proyek ini karena backend belum menyediakan endpoint subscription, tapi
// arsitekturnya (event 'push' di bawah) sudah disiapkan dan siap dipakai begitu
// server push tersedia — lihat PANDUAN_IMPLEMENTASI.md.

const CACHE_NAME = 'profile-app-shell-v2';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './src/styles/main.css',
  './src/styles/transitions.css',
  './src/main.js',
  './src/app.js',
  './src/config.js',
  './src/router.js',
  './src/routes.js',
  './src/errors.js',
  './src/ui/dom.js',
  './src/data/article-api.js',
  './src/data/article-model.js',
  './src/utils/animations.js',
  './src/utils/camera.js',
  './src/utils/debounce.js',
  './src/utils/geolocation.js',
  './src/utils/map.js',
  './src/utils/notifications.js',
  './src/pages/home/home-page.js',
  './src/pages/home/home-presenter.js',
  './src/pages/detail/detail-page.js',
  './src/pages/detail/detail-presenter.js',
  './src/pages/admin/admin-page.js',
  './src/pages/admin/admin-presenter.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Strategi: cache-first untuk asset statis, fallback ke network
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => cached);
    })
  );
});

// --- Web Push (dari server, jika sudah diaktifkan) ---
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Notifikasi', body: '' };
  event.waitUntil(
    self.registration.showNotification(data.title || 'Profil Pribadi', {
      body: data.body || '',
      icon: data.icon || undefined,
      badge: data.badge || undefined,
    })
  );
});

// --- Notifikasi lokal yang dipicu dari halaman (mis. fitur Map Location) ---
self.addEventListener('message', (event) => {
  if (event.data?.type !== 'SHOW_NOTIFICATION') return;
  const { title, body } = event.data.payload || {};
  self.registration.showNotification(title || 'Profil Pribadi', { body: body || '' });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      if (clients.length) return clients[0].focus();
      return self.clients.openWindow('./');
    })
  );
});
