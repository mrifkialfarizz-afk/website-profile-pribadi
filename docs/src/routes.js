// routes.js — Tabel rute: path -> kelas halaman (View)
import HomePage from './pages/home/home-page.js';
import DetailPage from './pages/detail/detail-page.js';
import AdminPage from './pages/admin/admin-page.js';

const routes = [
  { path: '/',             page: HomePage   }, // Beranda: profil + daftar artikel
  { path: '/admin',        page: AdminPage  }, // CMS: dashboard + CRUD + kamera
  { path: '/article/:id',  page: DetailPage }, // Detail artikel (shared element transition)
];

export default routes;
