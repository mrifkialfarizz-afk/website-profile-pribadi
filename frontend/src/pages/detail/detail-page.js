// detail-page.js — VIEW untuk halaman Detail Artikel
import DetailPresenter from './detail-presenter.js';
import ArticleModel from '../../data/article-model.js';
import { escapeHtml, formatDate, showToast, resolveThumbnailUrl } from '../../ui/dom.js';
import { fadeIn, popIn } from '../../utils/animations.js';
import { downloadBlob } from '../../utils/camera.js';

export default class DetailPage {
  constructor({ params } = {}) {
    this._params = params; // { id: '...' }
    this._article = null;
  }

  async render() {
    return `
      <section class="page detail-page">
        <a href="#/" class="back-link">← Kembali</a>
        <div id="detail-body"><p class="empty-state">Memuat artikel...</p></div>
      </section>
    `;
  }

  async afterRender() {
    const articleId = this._params?.id;
    if (!articleId) {
      this.showError('ID artikel tidak valid.');
      return;
    }
    this._presenter = new DetailPresenter({
      view: this,
      model: new ArticleModel(),
      articleId,
    });
    await this._presenter.loadArticle();
  }

  async beforeLeave() {} // tidak ada resource untuk dibersihkan

  showLoading() {
    const body = document.getElementById('detail-body');
    if (body) body.innerHTML = '<p class="empty-state">Memuat artikel...</p>';
  }

  showError(message) {
    const body = document.getElementById('detail-body');
    if (body) {
      body.innerHTML = `
        <div class="empty-state">
          ⚠️ ${escapeHtml(message)}
          <div><a href="#/" class="btn btn-secondary" style="margin-top:12px;display:inline-block;">← Kembali ke Beranda</a></div>
        </div>`;
    }
  }

  /**
   * SHARED ELEMENT TRANSITION (lanjutan dari Home):
   * Gambar di sini diberi view-transition-name yang SAMA dengan thumbnail di Home,
   * sehingga browser menganimasikan "morph" dari kecil -> besar (dan sebaliknya).
   */
  showArticle(article) {
    this._article = article;
    const body = document.getElementById('detail-body');
    if (!body) return;

    body.innerHTML = `
      ${article.thumbnail_url ? `
        <div class="detail-hero">
          <img
            id="detail-img"
            class="detail-hero__img"
            src="${resolveThumbnailUrl(article.thumbnail_url)}"
            alt="${escapeHtml(article.title)}"
            style="view-transition-name: article-img-${article.id}"
          />
        </div>` : ''}

      <div class="detail-meta">
        <span class="badge">${escapeHtml(article.category)}</span>
        <h1>${escapeHtml(article.title)}</h1>
        <time>${formatDate(article.created_at)}</time>
        <p class="detail-meta__content">${escapeHtml(article.content)}</p>
      </div>

      <div class="btn-group">
        ${article.thumbnail_url ? `<button id="btn-download" class="btn btn-primary">⬇ Unduh Gambar</button>` : ''}
        <a href="#/admin" class="btn btn-secondary">Edit di CMS →</a>
      </div>
    `;

    fadeIn(body, 350);

    document.getElementById('btn-download')?.addEventListener('click', async (e) => {
      popIn(e.currentTarget);
      await this._downloadImage(article);
    });
  }

  /** PRAKTIKUM 7: ambil gambar dari URL -> Blob -> unduh ke perangkat */
  async _downloadImage(article) {
    try {
      const res = await fetch(resolveThumbnailUrl(article.thumbnail_url));
      const blob = await res.blob();
      downloadBlob(blob, `artikel-${article.id}.png`);
      showToast('Gambar berhasil diunduh!', 'success');
    } catch {
      showToast('Gagal mengunduh gambar.', 'error');
    }
  }
}
