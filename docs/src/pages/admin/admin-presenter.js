// admin-presenter.js — PRESENTER untuk halaman Admin/CMS
//
// Mengatur orkestrasi data (lewat Model) untuk dashboard & operasi CRUD.
// Presenter tidak menyentuh DOM — semua tampilan didelegasikan ke View.
import { NetworkError, ApiError } from '../../errors.js';

export default class AdminPresenter {
  constructor({ view, model }) {
    this._view = view;
    this._model = model;
  }

  /** PRAKTIKUM Promise.all (Tugas 10): muat daftar artikel + statistik secara PARALEL */
  async loadDashboard() {
    try {
      const [articles, stats] = await Promise.all([
        this._model.getAll(),
        this._model.getStats(),
      ]);
      this._view.showDashboard(articles, stats);
    } catch (err) {
      this._view.showDashboardError(this._describeError(err));
    }
  }

  /** Simpan artikel (create jika editingId null, update jika ada) */
  async saveArticle(fields, thumbnailFile, editingId) {
    this._view.setSaving(true);
    try {
      if (editingId) {
        await this._model.update(editingId, fields, thumbnailFile);
        this._view.onSaveSuccess('Artikel berhasil diperbarui');
      } else {
        await this._model.add(fields, thumbnailFile);
        this._view.onSaveSuccess('Artikel berhasil ditambahkan');
      }
      await this.loadDashboard();
    } catch (err) {
      this._view.onSaveError(this._describeError(err));
    } finally {
      this._view.setSaving(false);
    }
  }

  /** Hapus artikel — View sudah menerapkan Optimistic UI sebelum memanggil ini */
  async deleteArticle(id) {
    try {
      await this._model.remove(id);
      const stats = await this._model.getStats();
      this._view.onDeleteSuccess(stats);
    } catch (err) {
      this._view.onDeleteError(this._describeError(err));
    }
  }

  _describeError(err) {
    if (err instanceof NetworkError) return 'Tidak ada koneksi ke server';
    if (err instanceof ApiError) return `Error ${err.status}: ${err.message}`;
    console.error(err);
    return 'Terjadi kesalahan tak terduga';
  }
}
