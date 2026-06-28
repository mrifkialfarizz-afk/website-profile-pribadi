// admin-page.js — VIEW untuk halaman Admin / CMS
//
// Menggabungkan: Dashboard (Promise.all), Form CRUD, Media Stream + Canvas API
// (ambil foto thumbnail dari kamera), upload file manual, dan Optimistic UI delete.
import AdminPresenter from './admin-presenter.js';
import ArticleModel from '../../data/article-model.js';
import { escapeHtml, showToast, resolveThumbnailUrl } from '../../ui/dom.js';
import { popIn } from '../../utils/animations.js';
import { startCamera, stopCamera, captureFrame, canvasToBlob } from '../../utils/camera.js';

export default class AdminPage {
  constructor() {
    this._articles = [];
    this._editingId = null;
    this._presenter = null;

    // State kamera & thumbnail
    this._stream = null;
    this._facingMode = 'environment';
    this._grayscale = false;
    this._pendingThumbnailBlob = null; // Blob/File yang akan diupload saat submit
    this._existingThumbnailUrl = null; // thumbnail lama saat mode edit (jika tidak diganti)
  }

  async render() {
    return `
      <div class="admin-wrap">
        <h2>Dashboard</h2>
        <div class="dashboard">
          <div class="stat-card"><h3>Total Artikel</h3><p id="stat-total">-</p></div>
          <div class="stat-card"><h3>Published</h3><p id="stat-published">-</p></div>
          <div class="stat-card"><h3>Draft</h3><p id="stat-draft">-</p></div>
          <div class="stat-card"><h3>Kategori</h3><p id="stat-categories">-</p></div>
        </div>

        <div class="admin-grid">
          <div class="panel">
            <h2 id="form-title">Tambah Artikel Baru</h2>

            <!-- ===== Thumbnail picker: preview + kamera + upload file ===== -->
            <div class="thumb-picker">
              <div class="thumb-preview" id="thumb-preview">
                <span class="empty-state" id="thumb-empty-label">Belum ada gambar</span>
              </div>

              <div class="thumb-actions" id="thumb-actions">
                <button type="button" id="btn-open-camera" class="btn btn-secondary">📷 Ambil dari Kamera</button>
                <button type="button" id="btn-open-file" class="btn btn-secondary">📁 Upload File</button>
                <input type="file" id="input-file-thumbnail" accept="image/*" hidden />
              </div>

              <!-- Panel kamera (tersembunyi sampai dibuka) -->
              <div class="camera-panel" id="camera-panel" hidden>
                <div class="camera-viewport" id="camera-viewport">
                  <video id="camera-video" class="camera-video" autoplay playsinline muted></video>
                  <div class="camera-overlay">
                    <button type="button" id="btn-capture" class="btn btn-primary">📷 Ambil Foto</button>
                    <button type="button" id="btn-switch" class="btn btn-secondary" title="Ganti kamera">🔄</button>
                    <button type="button" id="btn-gray" class="btn btn-secondary" title="Filter Grayscale">⚫</button>
                    <button type="button" id="btn-close-camera" class="btn btn-secondary">✕ Tutup</button>
                  </div>
                </div>
                <div class="camera-error" id="camera-error" hidden>
                  <p id="camera-error-msg"></p>
                  <button type="button" id="btn-retry-camera" class="btn btn-secondary">Coba Lagi</button>
                </div>
                <div class="camera-capture-preview" id="camera-capture-preview" hidden>
                  <img id="capture-preview-img" alt="Hasil tangkapan kamera" />
                  <div class="btn-group">
                    <button type="button" id="btn-use-photo" class="btn btn-primary">✓ Gunakan Foto Ini</button>
                    <button type="button" id="btn-retake" class="btn btn-secondary">🔄 Ulangi</button>
                  </div>
                </div>
              </div>
            </div>
            <!-- ===== /thumbnail picker ===== -->

            <form id="article-form">
              <div class="form-group">
                <label for="input-title">Judul</label>
                <input type="text" id="input-title" required />
              </div>
              <div class="form-group">
                <label for="input-category">Kategori</label>
                <input type="text" id="input-category" placeholder="contoh: Tutorial" />
              </div>
              <div class="form-group">
                <label for="input-excerpt">Ringkasan Singkat</label>
                <input type="text" id="input-excerpt" placeholder="Ringkasan untuk tampilan kartu" />
              </div>
              <div class="form-group">
                <label for="input-content">Isi Artikel</label>
                <textarea id="input-content" required></textarea>
              </div>
              <div class="form-group">
                <label for="input-status">Status</label>
                <select id="input-status">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <button type="submit" id="btn-save" class="btn btn-primary">Simpan</button>
              <button type="button" id="cancel-edit" class="btn btn-secondary hidden">Batal Edit</button>
            </form>
          </div>

          <div class="panel">
            <h2>Daftar Artikel</h2>
            <table>
              <thead>
                <tr><th>Judul</th><th>Kategori</th><th>Status</th><th>Dibuat</th><th>Aksi</th></tr>
              </thead>
              <tbody id="articles-table-body">
                <tr><td colspan="5" class="empty-state">Memuat data...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    this._presenter = new AdminPresenter({ view: this, model: new ArticleModel() });
    this._bindFormEvents();
    this._bindThumbnailEvents();
    await this._presenter.loadDashboard();
  }

  /** PRAKTIKUM 9: Cleanup lifecycle — matikan kamera saat meninggalkan halaman Admin */
  async beforeLeave() {
    stopCamera(this._stream);
    this._stream = null;
    console.log('[AdminPage] Stream kamera dihentikan (beforeLeave)');
  }

  // ---------------------------------------------------------
  // DASHBOARD
  // ---------------------------------------------------------
  showDashboard(articles, stats) {
    this._articles = articles;
    this._renderStats(stats);
    this._renderTable();
  }

  showDashboardError(message) {
    showToast(message, 'error');
    const tbody = document.getElementById('articles-table-body');
    if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="empty-state">⚠️ ${escapeHtml(message)}</td></tr>`;
  }

  _renderStats(s) {
    document.getElementById('stat-total').textContent = s.total;
    document.getElementById('stat-published').textContent = s.published;
    document.getElementById('stat-draft').textContent = s.draft;
    document.getElementById('stat-categories').textContent = s.categories;
  }

  _renderTable() {
    const tbody = document.getElementById('articles-table-body');
    if (!this._articles.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Belum ada artikel</td></tr>';
      return;
    }
    tbody.innerHTML = this._articles.map((a) => `
      <tr data-id="${a.id}">
        <td>${escapeHtml(a.title)}</td>
        <td>${escapeHtml(a.category)}</td>
        <td><span class="status status-${a.status}">${a.status}</span></td>
        <td>${new Date(a.created_at).toLocaleDateString('id-ID')}</td>
        <td class="actions">
          <button class="btn-edit" data-id="${a.id}">Edit</button>
          <button class="btn-delete" data-id="${a.id}">Hapus</button>
        </td>
      </tr>`).join('');

    tbody.querySelectorAll('.btn-edit').forEach((btn) =>
      btn.addEventListener('click', () => this._startEdit(Number(btn.dataset.id))));
    tbody.querySelectorAll('.btn-delete').forEach((btn) =>
      btn.addEventListener('click', () => this._confirmDelete(Number(btn.dataset.id))));
  }

  // ---------------------------------------------------------
  // CREATE / UPDATE FORM
  // ---------------------------------------------------------
  _bindFormEvents() {
    const form = document.getElementById('article-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fields = {
        title: document.getElementById('input-title').value.trim(),
        category: document.getElementById('input-category').value.trim() || 'Umum',
        excerpt: document.getElementById('input-excerpt').value.trim(),
        content: document.getElementById('input-content').value.trim(),
        status: document.getElementById('input-status').value,
      };
      if (!fields.title || !fields.content) {
        showToast('Judul dan isi artikel wajib diisi', 'error');
        return;
      }
      await this._presenter.saveArticle(fields, this._pendingThumbnailBlob, this._editingId);
    });

    document.getElementById('cancel-edit').addEventListener('click', () => this._resetForm());
  }

  _startEdit(id) {
    const article = this._articles.find((a) => a.id === id);
    if (!article) return;

    this._editingId = id;
    document.getElementById('input-title').value = article.title;
    document.getElementById('input-category').value = article.category;
    document.getElementById('input-excerpt').value = article.excerpt || '';
    document.getElementById('input-content').value = article.content;
    document.getElementById('input-status').value = article.status;

    this._existingThumbnailUrl = article.thumbnail_url;
    this._pendingThumbnailBlob = null;
    this._renderThumbPreview(article.thumbnail_url ? resolveThumbnailUrl(article.thumbnail_url) : null);

    document.getElementById('form-title').textContent = `Edit Artikel #${id}`;
    document.getElementById('cancel-edit').classList.remove('hidden');
    document.querySelector('.panel').scrollIntoView({ behavior: 'smooth' });
  }

  _resetForm() {
    document.getElementById('article-form').reset();
    this._editingId = null;
    this._pendingThumbnailBlob = null;
    this._existingThumbnailUrl = null;
    document.getElementById('form-title').textContent = 'Tambah Artikel Baru';
    document.getElementById('cancel-edit').classList.add('hidden');
    this._renderThumbPreview(null);
  }

  setSaving(isSaving) {
    const btn = document.getElementById('btn-save');
    if (!btn) return;
    btn.disabled = isSaving;
    btn.innerHTML = isSaving ? '<span class="spinner-sm"></span> Menyimpan...' : 'Simpan';
  }

  onSaveSuccess(message) {
    showToast(message, 'success');
    this._resetForm();
  }

  onSaveError(message) {
    showToast(message, 'error');
  }

  // ---------------------------------------------------------
  // DELETE — Optimistic UI dengan rollback
  // ---------------------------------------------------------
  async _confirmDelete(id) {
    const article = this._articles.find((a) => a.id === id);
    if (!article) return;
    if (!confirm(`Hapus artikel "${article.title}"?`)) return;

    const snapshot = [...this._articles];

    // Optimistic: hilangkan dari UI dulu, sebelum tahu hasil dari server
    this._articles = this._articles.filter((a) => a.id !== id);
    this._renderTable();

    this._deleteSnapshot = snapshot; // disimpan untuk rollback bila gagal
    this._deletedTitle = article.title;
    await this._presenter.deleteArticle(id);
  }

  onDeleteSuccess(stats) {
    showToast(`"${this._deletedTitle}" berhasil dihapus`, 'success');
    this._renderStats(stats);
  }

  onDeleteError(message) {
    this._articles = this._deleteSnapshot; // rollback
    this._renderTable();
    showToast(message, 'error');
  }

  // ---------------------------------------------------------
  // THUMBNAIL: Upload file manual
  // ---------------------------------------------------------
  _bindThumbnailEvents() {
    document.getElementById('btn-open-file').addEventListener('click', (e) => {
      popIn(e.currentTarget);
      document.getElementById('input-file-thumbnail').click();
    });

    document.getElementById('input-file-thumbnail').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      this._pendingThumbnailBlob = file;
      this._renderThumbPreview(URL.createObjectURL(file));
      showToast('Foto dipilih dari file', 'info', 1500);
    });

    // ----- Kamera -----
    document.getElementById('btn-open-camera').addEventListener('click', async (e) => {
      popIn(e.currentTarget);
      document.getElementById('camera-panel').hidden = false;
      await this._initCamera();
    });

    document.getElementById('btn-close-camera').addEventListener('click', () => {
      stopCamera(this._stream);
      this._stream = null;
      document.getElementById('camera-panel').hidden = true;
    });

    document.getElementById('btn-capture').addEventListener('click', async (e) => {
      popIn(e.currentTarget);
      await this._capturePhoto();
    });

    document.getElementById('btn-switch').addEventListener('click', async (e) => {
      popIn(e.currentTarget);
      this._facingMode = this._facingMode === 'environment' ? 'user' : 'environment';
      await this._initCamera();
    });

    document.getElementById('btn-gray').addEventListener('click', (e) => {
      this._grayscale = !this._grayscale;
      e.currentTarget.classList.toggle('btn-primary', this._grayscale);
      showToast(this._grayscale ? 'Filter grayscale aktif' : 'Filter grayscale nonaktif', 'info', 1500);
    });

    document.getElementById('btn-retry-camera').addEventListener('click', () => this._initCamera());

    document.getElementById('btn-retake').addEventListener('click', () => {
      document.getElementById('camera-capture-preview').hidden = true;
      document.getElementById('camera-viewport').hidden = false;
    });

    document.getElementById('btn-use-photo').addEventListener('click', () => {
      const previewImg = document.getElementById('capture-preview-img');
      this._renderThumbPreview(previewImg.src);
      stopCamera(this._stream);
      this._stream = null;
      document.getElementById('camera-panel').hidden = true;
      showToast('Foto kamera siap diupload', 'success', 1500);
    });
  }

  async _initCamera() {
    const videoEl = document.getElementById('camera-video');
    try {
      stopCamera(this._stream); // hentikan stream sebelumnya (mis. saat ganti kamera)
      this._stream = await startCamera(videoEl, this._facingMode);
      this._hideCameraError();
      document.getElementById('camera-viewport').hidden = false;
      document.getElementById('camera-capture-preview').hidden = true;
    } catch (err) {
      console.error('[AdminPage] Gagal akses kamera:', err);
      this._showCameraError(err);
    }
  }

  async _capturePhoto() {
    const videoEl = document.getElementById('camera-video');
    if (!videoEl || !this._stream) {
      showToast('Kamera belum siap', 'error');
      return;
    }
    // PRAKTIKUM 6: capture frame dari video ke canvas (+ filter grayscale opsional)
    const canvas = captureFrame(videoEl, { grayscale: this._grayscale });
    // PRAKTIKUM 7: konversi canvas -> Blob, lalu preview lewat Object URL
    const blob = await canvasToBlob(canvas);
    this._pendingThumbnailBlob = blob;

    const previewImg = document.getElementById('capture-preview-img');
    const localUrl = URL.createObjectURL(blob);
    previewImg.src = localUrl;
    previewImg.onload = () => URL.revokeObjectURL(localUrl); // bebaskan memori setelah dimuat

    document.getElementById('camera-viewport').hidden = true;
    document.getElementById('camera-capture-preview').hidden = false;
  }

  _showCameraError(err) {
    const panel = document.getElementById('camera-error');
    const msg = document.getElementById('camera-error-msg');
    document.getElementById('camera-viewport').hidden = true;
    panel.hidden = false;

    let text = err.message || 'Terjadi kesalahan tidak dikenal.';
    if (err.name === 'NotAllowedError') text = 'Izin kamera ditolak. Aktifkan izin kamera di browser, lalu klik "Coba Lagi".';
    else if (err.name === 'NotFoundError') text = 'Perangkat ini tidak memiliki kamera.';
    else if (err.name === 'NotReadableError') text = 'Kamera sedang dipakai aplikasi lain.';
    msg.textContent = text;
  }

  _hideCameraError() {
    document.getElementById('camera-error').hidden = true;
  }

  _renderThumbPreview(src) {
    const preview = document.getElementById('thumb-preview');
    if (src) {
      preview.innerHTML = `<img src="${src}" alt="Preview thumbnail" />`;
    } else {
      preview.innerHTML = '<span class="empty-state" id="thumb-empty-label">Belum ada gambar</span>';
    }
  }
}
