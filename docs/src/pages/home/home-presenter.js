// home-presenter.js — PRESENTER untuk halaman Beranda
//
// Presenter menjembatani Model (data) dan View (tampilan):
// - Mengambil data dari Model
// - Memerintahkan View untuk menampilkan hasilnya
// - Tidak memanipulasi DOM secara langsung
import { NetworkError, ApiError } from '../../errors.js';

export default class HomePresenter {
  constructor({ view, model }) {
    this._view = view;
    this._model = model;
    this._abortController = null; // PRAKTIKUM: AbortController untuk cegah race condition
  }

  /** Muat artikel published, dengan pencarian opsional. Dipanggil ulang setiap user mengetik. */
  async loadArticles(keyword = '') {
    // Batalkan request pencarian sebelumnya jika masih berjalan
    if (this._abortController) this._abortController.abort();
    this._abortController = new AbortController();

    this._view.showLoading();
    try {
      const articles = await this._model.getPublished(keyword, this._abortController.signal);
      if (!articles.length) {
        this._view.showEmpty();
      } else {
        this._view.showArticles(articles);
      }
    } catch (err) {
      if (err.name === 'AbortError') return; // request lama dibatalkan, bukan error sebenarnya
      console.error('[HomePresenter] Gagal memuat artikel:', err);
      if (err instanceof NetworkError) {
        this._view.showError('Tidak ada koneksi ke server.');
      } else if (err instanceof ApiError) {
        this._view.showError(`Gagal memuat artikel: ${err.message}`);
      } else {
        this._view.showError('Terjadi kesalahan tak terduga.');
      }
    }
  }
}
