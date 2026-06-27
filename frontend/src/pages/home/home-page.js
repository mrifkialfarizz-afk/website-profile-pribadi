import HomePresenter from './home-presenter.js';
import ArticleModel from '../../data/article-model.js';
import { skeletonCards, escapeHtml, formatDate, showToast } from '../../ui/dom.js';
import { cardEnter, fadeIn } from '../../utils/animations.js';
import { BASE_URL } from '../../config.js';
import { debounce } from '../../utils/debounce.js';
import { getCurrentPosition, reverseGeocode } from '../../utils/geolocation.js';
import { initMap, setUserMarker, destroyMap, HOME_LOCATION } from '../../utils/map.js';
import { requestNotificationPermission, showLocalNotification } from '../../utils/notifications.js';

export default class HomePage {
  constructor() {
    this._presenter = null;
  }

  async render() {
    return `
      <section class="hero" id="about">
        <div class="avatar">RAF</div>
        <div class="hero-info">
          <h1>Rifky Al Fariz</h1>
          <div class="role">Web Developer</div>
          <p>
            Halo saya Muhammad Rifki Al Fariz biasa dipanggil Rifki. Saya berusia 20 Tahun dan asal saya dari kabupaten Cilacap.
            Saat ini saya sedang aktif menjadi mahasiswa di Universitas Nahdlatul Ulama Al Ghazali Cilacap dengan Program Studi Informatika.
          </p>
          <div class="social-links">
            <a href="mailto:m.rifkialfarizz@gmail.com">Email</a>
            <a href="https://instagram.com/rfky_alfriz" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.tiktok.com/@rfkyalfarizz" target="_blank" rel="noopener noreferrer">Tiktok</a>
          </div>
        </div>
      </section>

      <section id="skills">
        <h2>Skill</h2>
        <div class="skills">
          <span class="skill-chip">HTML &amp; CSS</span>
          <span class="skill-chip">JavaScript (Async/Await)</span>
          <span class="skill-chip">SPA &amp; MVP</span>
          <span class="skill-chip">View Transition API</span>
          <span class="skill-chip">Media Stream &amp; Canvas API</span>
          <span class="skill-chip">Node.js &amp; Express</span>
        </div>
      </section>

      <section id="location">
        <h2>Lokasi</h2>
        <p class="location-desc">
          Domisili saya saat ini: <strong>${escapeHtml(HOME_LOCATION.label)}</strong>.
          Klik tombol di bawah untuk menampilkan lokasi Anda sendiri di peta yang sama
          (memakai Geolocation API browser Anda).
        </p>
        <div class="location-actions">
          <button id="btn-locate-me" class="btn btn-primary">📍 Tampilkan Lokasi Saya</button>
          <span id="location-status" class="location-status"></span>
        </div>
        <div id="map" class="map-container"></div>
      </section>

      <section id="articles">
        <h2>Artikel Terbaru</h2>
        <div class="search-wrap">
          <input type="text" id="search-input" placeholder="Cari artikel..." />
        </div>
        <div id="articles-list" class="articles-grid">
          ${skeletonCards(3)}
        </div>
      </section>
    `;
  }

  async afterRender() {
    this._presenter = new HomePresenter({ view: this, model: new ArticleModel() });

    const searchInput = document.getElementById('search-input');
    const handleSearch = debounce((keyword) => this._presenter.loadArticles(keyword), 400);
    searchInput?.addEventListener('input', (e) => handleSearch(e.target.value));

    await this._presenter.loadArticles();

    this._initLocationFeature();
  }

  /** PRAKTIKUM (Tugas 12): Map Location — peta domisili + lokasi pengguna real-time */
  _initLocationFeature() {
    const mapEl = document.getElementById('map');
    if (!mapEl) return;

    try {
      initMap('map', HOME_LOCATION);
      fadeIn(mapEl);
    } catch (err) {
      mapEl.innerHTML = `<p class="empty-state">⚠️ ${escapeHtml(err.message)}</p>`;
    }

    const btn = document.getElementById('btn-locate-me');
    const statusEl = document.getElementById('location-status');
    btn?.addEventListener('click', () => this._handleLocateMe(btn, statusEl));
  }

  async _handleLocateMe(btn, statusEl) {
    btn.disabled = true;
    btn.textContent = '⏳ Mencari lokasi...';
    statusEl.textContent = '';

    try {
      const { lat, lng, accuracy } = await getCurrentPosition();

      let label = `Lokasi Anda (akurasi ±${Math.round(accuracy)} m)`;
      try {
        label = await reverseGeocode(lat, lng);
      } catch {
        /* reverse geocode opsional, abaikan jika gagal (mis. offline) */
      }

      setUserMarker({ lat, lng, accuracy }, label);
      statusEl.textContent = `📍 ${label}`;
      showToast('Lokasi Anda berhasil ditampilkan di peta!', 'success');

      // NILAI PLUS: Service Worker API & Web Push Notification
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        await showLocalNotification('Lokasi ditemukan', `Posisi Anda: ${label}`);
      }
    } catch (err) {
      statusEl.textContent = `⚠️ ${err.message}`;
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '📍 Tampilkan Lokasi Saya';
    }
  }

  async beforeLeave() {
    destroyMap();
  }

  showLoading() {
    const list = document.getElementById('articles-list');
    if (list) list.innerHTML = skeletonCards(3);
  }

  showEmpty() {
    const list = document.getElementById('articles-list');
    if (list) list.innerHTML = '<p class="empty-state">Belum ada artikel yang dipublikasikan.</p>';
  }

  showError(message) {
    const list = document.getElementById('articles-list');
    if (list) list.innerHTML = `<p class="empty-state">⚠️ ${escapeHtml(message)}</p>`;
  }

  showArticles(articles) {
    const list = document.getElementById('articles-list');
    if (!list) return;

    list.innerHTML = articles.map((a) => `
      <article class="article-card" data-id="${a.id}" role="link" tabindex="0">
        ${a.thumbnail_url ? `
          <div class="article-card__img-wrap">
            <img
              class="article-card__img"
              src="${BASE_URL}${a.thumbnail_url}"
              alt="${escapeHtml(a.title)}"
              loading="lazy"
              style="view-transition-name: article-img-${a.id}"
            />
          </div>` : ''}
        <span class="badge">${escapeHtml(a.category)}</span>
        <h3>${escapeHtml(a.title)}</h3>
        <p>${escapeHtml(a.excerpt || a.content.slice(0, 120) + '...')}</p>
        <time>${formatDate(a.created_at)}</time>
      </article>
    `).join('');

    // Animasi stagger: tiap kartu masuk dengan delay berbeda (WAAPI)
    const cards = list.querySelectorAll('.article-card');
    cards.forEach((card, i) => {
      cardEnter(card, i * 60);
      const goToDetail = () => { location.hash = `#/article/${card.dataset.id}`; };
      card.addEventListener('click', goToDetail);
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter') goToDetail(); });
    });
  }
}
