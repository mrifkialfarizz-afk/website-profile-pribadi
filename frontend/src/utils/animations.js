// animations.js — Pembungkus Web Animations API (WAAPI)
// Semua animasi terprogram (bukan CSS keyframes) lewat modul ini, dan semuanya
// menghormati preferensi pengguna prefers-reduced-motion.

/** Cek apakah pengguna mengaktifkan "Reduce Motion" di OS/browser */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Wrapper dasar Element.animate() — otomatis dilewati jika reduced-motion aktif */
export function animate(el, keyframes, options) {
  if (!el || prefersReducedMotion()) return null;
  return el.animate(keyframes, options);
}

/** Efek "pop": mengecil sedikit lalu kembali normal (feedback tombol ditekan) */
export function popIn(el) {
  return animate(
    el,
    [
      { transform: 'scale(0.92)', opacity: 0.7 },
      { transform: 'scale(1)', opacity: 1 },
    ],
    { duration: 200, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', fill: 'forwards' }
  );
}

/** Toast muncul dari bawah ke posisi normal */
export function toastSlideIn(el) {
  return animate(
    el,
    [
      { transform: 'translateY(24px)', opacity: 0 },
      { transform: 'translateY(0)', opacity: 1 },
    ],
    { duration: 280, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', fill: 'forwards' }
  );
}

/** Toast hilang ke bawah */
export function toastSlideOut(el) {
  return animate(
    el,
    [
      { transform: 'translateY(0)', opacity: 1 },
      { transform: 'translateY(24px)', opacity: 0 },
    ],
    { duration: 200, easing: 'ease-in', fill: 'forwards' }
  );
}

/** Fade in: opacity 0 -> 1 */
export function fadeIn(el, duration = 300) {
  return animate(el, [{ opacity: 0 }, { opacity: 1 }], {
    duration,
    easing: 'ease-out',
    fill: 'forwards',
  });
}

/** Kartu muncul dari bawah dengan stagger (delay berbeda tiap kartu) */
export function cardEnter(el, delay = 0) {
  return animate(
    el,
    [
      { transform: 'translateY(20px)', opacity: 0 },
      { transform: 'translateY(0)', opacity: 1 },
    ],
    { duration: 350, easing: 'ease-out', fill: 'forwards', delay }
  );
}
