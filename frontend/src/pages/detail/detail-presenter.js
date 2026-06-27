// detail-presenter.js — PRESENTER untuk halaman Detail Artikel
export default class DetailPresenter {
  constructor({ view, model, articleId }) {
    this._view = view;
    this._model = model;
    this._articleId = articleId;
  }

  async loadArticle() {
    this._view.showLoading();
    try {
      const article = await this._model.getById(this._articleId);
      this._view.showArticle(article);
    } catch (err) {
      console.error('[DetailPresenter] Gagal memuat artikel:', err);
      this._view.showError('Artikel tidak ditemukan atau server tidak merespons.');
    }
  }
}
