// notifications.js — Pembungkus Notification API + komunikasi ke Service Worker
// (NILAI PLUS: Service Worker API & Web Push Notification)

/** Daftarkan service worker (dipanggil sekali saat aplikasi start) */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const registration = await navigator.serviceWorker.register('./sw.js');
    return registration;
  } catch (err) {
    console.warn('[SW] Gagal mendaftarkan service worker:', err);
    return null;
  }
}

/** Minta izin notifikasi ke pengguna (harus dipicu oleh interaksi pengguna) */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
}

/**
 * Tampilkan notifikasi lewat Service Worker (lebih andal daripada `new Notification()`
 * langsung karena tetap berjalan walau tab tidak fokus / browser mendukung di mobile).
 */
export async function showLocalNotification(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return false;

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    registration.active?.postMessage({ type: 'SHOW_NOTIFICATION', payload: { title, body } });
    return true;
  }

  // Fallback jika Service Worker tidak tersedia
  new Notification(title, { body });
  return true;
}
