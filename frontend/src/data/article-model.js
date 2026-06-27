// article-model.js — MODEL dalam pola MVP
// Model bertanggung jawab atas data & aturan bisnis. Model TIDAK tahu apa pun
// tentang DOM/tampilan — ia hanya memanggil article-api.js dan mengembalikan data.
import {
  fetchArticles,
  fetchArticle,
  fetchStats,
  createArticle,
  updateArticle,
  deleteArticle,
} from './article-api.js';

export default class ArticleModel {
  /** Ambil artikel published untuk halaman publik, dengan pencarian opsional */
  async getPublished(keyword = '', signal) {
    const params = `?status=published${keyword ? `&search=${encodeURIComponent(keyword)}` : ''}`;
    const res = await fetchArticles(params, signal);
    return res.data;
  }

  /** Ambil SEMUA artikel (untuk CMS/admin, termasuk draft) */
  async getAll() {
    const res = await fetchArticles();
    return res.data;
  }

  /** Ambil satu artikel berdasarkan ID */
  async getById(id) {
    const res = await fetchArticle(id);
    return res.data;
  }

  /** Ambil statistik dashboard (total, published, draft, kategori) */
  async getStats() {
    const res = await fetchStats();
    return res.data;
  }

  /**
   * Tambah artikel baru.
   * @param {{title,category,excerpt,content,status}} fields
   * @param {Blob|File|null} thumbnailFile
   */
  async add(fields, thumbnailFile) {
    return createArticle(fields, thumbnailFile);
  }

  /** Perbarui artikel */
  async update(id, fields, thumbnailFile) {
    return updateArticle(id, fields, thumbnailFile);
  }

  /** Hapus artikel */
  async remove(id) {
    return deleteArticle(id);
  }
}
