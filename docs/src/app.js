import Router from './router.js';
import routes from './routes.js';
import { registerServiceWorker } from './utils/notifications.js';
import { onInstallAvailabilityChange, promptInstall, isRunningAsInstalledPwa } from './utils/pwa-install.js';

export function initApp() {
  const rootEl = document.getElementById('app');
  renderShell();

  const router = new Router({ rootElement: rootEl, routes });
  router.start();

  // NILAI PLUS: Service Worker API — daftarkan App Shell cache + siap menerima push
  registerServiceWorker();

  // PWA: tombol "Install App" hanya tampil saat browser mengizinkan instalasi
  initInstallButton();
}

function renderShell() {
  document.body.insertAdjacentHTML('afterbegin', `
    <header class="navbar">
      <div class="brand">Rifky Al Fariz</div>
      <nav>
        <a href="#/" data-route>Beranda</a>
        <a href="#/admin" data-route>Admin CMS</a>
        <button id="btn-install-pwa" class="btn-install hidden" type="button">⬇️ Install App</button>
      </nav>
    </header>
  `);
  document.body.insertAdjacentHTML('beforeend', `
    <footer>&copy; 2026 Nama Anda. SPA + PWA - Tugas Pertemuan 13 (PWA, GitHub &amp; Deployment).</footer>
  `);
}

function initInstallButton() {
  const btn = document.getElementById('btn-install-pwa');
  if (!btn || isRunningAsInstalledPwa()) return; // sudah berjalan sebagai app, tak perlu tombol

  onInstallAvailabilityChange((available) => {
    btn.classList.toggle('hidden', !available);
  });

  btn.addEventListener('click', async () => {
    const outcome = await promptInstall();
    if (outcome === 'accepted') {
      btn.classList.add('hidden');
    }
  });
}
