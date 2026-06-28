// dom.js — Helper DOM generik: toast, skeleton loading, format, escape HTML
import { toastSlideIn, toastSlideOut } from '../utils/animations.js';
import { BASE_URL } from '../config.js';

/**
 * Ubah thumbnail_url dari database jadi URL yang bisa langsung dipakai di <img src>.
 * - Cloudinary (data baru) sudah berupa URL lengkap (https://res.cloudinary.com/...) → pakai langsung.
 * - Data lama (sebelum pakai Cloudinary) masih path relatif (/uploads/xxx.png) → gabungkan dengan BASE_URL.
 */
export function resolveThumbnailUrl(thumbnailUrl) {
  if (!thumbnailUrl) return null;
  return thumbnailUrl.startsWith('http') ? thumbnailUrl : `${BASE_URL}${thumbnailUrl}`;
}

/** Tampilkan toast notification (pengganti alert()) */
export function showToast(message, type = 'success', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.setAttribute('role', 'alert');
  el.textContent = message;
  container.appendChild(el);

  toastSlideIn(el);

  setTimeout(async () => {
    const anim = toastSlideOut(el);
    if (anim) await anim.finished.catch(() => {});
    el.remove();
  }, duration);
}

/** HTML skeleton card — placeholder saat data sedang dimuat (mencegah layout shift) */
export function skeletonCards(count = 3) {
  return Array.from(
    { length: count },
    () => `
    <article class="article-card article-card--skeleton" aria-hidden="true">
      <div class="skeleton-pulse" style="height:140px;border-radius:8px;margin-bottom:10px;"></div>
      <div class="skeleton-pulse skeleton-line" style="width:70%;height:1rem;"></div>
      <div class="skeleton-pulse skeleton-line" style="width:40%;height:0.8rem;margin-top:8px;"></div>
    </article>`
  ).join('');
}

/** Format tanggal ke format Indonesia */
export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Escape HTML untuk mencegah XSS saat menyisipkan teks dari data ke template */
export function escapeHtml(str = '') {
  return str.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
