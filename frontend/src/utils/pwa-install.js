// pwa-install.js — Pembungkus event `beforeinstallprompt` (Add to Home Screen / Install PWA)
//
// Browser (Chrome/Edge/Android) menahan event ini lalu memberi kita kendali
// untuk menampilkan tombol "Install" sendiri, bukan banner otomatis bawaan.

let deferredPrompt = null;
const listeners = new Set();

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault(); // cegah banner otomatis bawaan browser
  deferredPrompt = event;
  listeners.forEach((cb) => cb(true));
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  listeners.forEach((cb) => cb(false));
});

/** Apakah aplikasi sudah berjalan dalam mode PWA terinstall (standalone)? */
export function isRunningAsInstalledPwa() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true // iOS Safari
  );
}

/** Daftarkan callback yang dipanggil saat status "bisa diinstall" berubah */
export function onInstallAvailabilityChange(callback) {
  listeners.add(callback);
  // Beri tahu status saat ini langsung (jika sudah ada prompt tertunda)
  if (deferredPrompt) callback(true);
  return () => listeners.delete(callback);
}

/** Tampilkan dialog install bawaan browser. Harus dipanggil dari klik tombol (user gesture). */
export async function promptInstall() {
  if (!deferredPrompt) return 'unavailable';
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice; // 'accepted' | 'dismissed'
  deferredPrompt = null;
  return outcome;
}
