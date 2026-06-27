// router.js — Hash Router untuk Single-Page Application
//
// Tanggung jawab:
// 1. Membaca location.hash dan mencocokkan ke rute terdaftar (mendukung parameter :id)
// 2. Memanggil lifecycle halaman: beforeLeave() (halaman lama) -> render() -> afterRender()
// 3. Membungkus pergantian DOM dengan document.startViewTransition() (PRAKTIKUM 1)
export default class Router {
  constructor({ rootElement, routes }) {
    this._root = rootElement;
    this._routes = routes;
    this._currentPage = null;
  }

  start() {
    window.addEventListener('hashchange', () => this._renderPage());
    window.addEventListener('load', () => this._renderPage());
  }

  /** Cocokkan hash saat ini ke salah satu rute, dukung parameter seperti /article/:id */
  _match() {
    const hash = location.hash || '#/';
    const urlPath = hash.slice(1) || '/';
    const urlSegments = urlPath.split('/').filter(Boolean);

    for (const route of this._routes) {
      const routeSegments = route.path.split('/').filter(Boolean);
      if (routeSegments.length !== urlSegments.length) continue;

      const params = {};
      let matched = true;

      for (let i = 0; i < routeSegments.length; i++) {
        if (routeSegments[i].startsWith(':')) {
          params[routeSegments[i].slice(1)] = decodeURIComponent(urlSegments[i]);
        } else if (routeSegments[i] !== urlSegments[i]) {
          matched = false;
          break;
        }
      }
      if (matched) return { PageClass: route.page, params };
    }
    // Fallback: rute pertama (Beranda) jika tidak ada yang cocok
    return { PageClass: this._routes[0].page, params: {} };
  }

  async _renderPage() {
    const { PageClass, params } = this._match();

    // 1) Bersihkan resource halaman lama (mis. matikan kamera) SEBELUM pindah
    if (this._currentPage?.beforeLeave) {
      await this._currentPage.beforeLeave();
    }

    const page = new PageClass({ params });

    const updateDOM = async () => {
      this._root.innerHTML = await page.render();
      if (page.afterRender) await page.afterRender();
    };

    // PRAKTIKUM 1 — View Transition API
    // Feature detection: browser lama tetap berfungsi (progressive enhancement)
    if (!document.startViewTransition) {
      await updateDOM();
    } else {
      const transition = document.startViewTransition(updateDOM);
      // catch agar tidak error jika transisi di-interrupt oleh navigasi berikutnya
      await transition.finished.catch(() => {});
    }

    this._currentPage = page;
    this._updateNavLinks();
  }

  _updateNavLinks() {
    const hash = location.hash || '#/';
    document.querySelectorAll('.navbar a[data-route]').forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === hash);
    });
  }
}
