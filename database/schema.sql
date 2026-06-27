-- =========================================================
--  Database: profile_cms
--  Tugas Pertemuan 10 - Integrasi Website Profil Pribadi
--  dengan Backend & Database (Async JavaScript)
-- =========================================================

CREATE DATABASE IF NOT EXISTS profile_cms
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE profile_cms;

-- Tabel artikel (dikelola lewat CMS / fitur Tambah-Edit-Hapus)
CREATE TABLE IF NOT EXISTS articles (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(255)      NOT NULL,
  category      VARCHAR(100)      NOT NULL DEFAULT 'Umum',
  excerpt       VARCHAR(300)      NULL,
  content       TEXT              NOT NULL,
  thumbnail_url VARCHAR(500)      NULL,
  status        ENUM('draft','published') NOT NULL DEFAULT 'draft',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data contoh (boleh diganti/dihapus)
INSERT INTO articles (title, category, excerpt, content, status) VALUES
('Memulai Karier sebagai Web Developer', 'Karier',
 'Beberapa langkah awal yang saya tempuh untuk masuk ke dunia web development.',
 'Isi lengkap artikel tentang langkah-langkah memulai karier sebagai web developer, mulai dari belajar HTML/CSS, JavaScript, hingga membangun portofolio.',
 'published'),

('Mengenal Async JavaScript', 'Tutorial',
 'Async/await membuat kode asynchronous lebih mudah dibaca dibanding callback.',
 'Isi lengkap artikel mengenai Promise, async/await, error handling, serta pola-pola umum seperti debounce, AbortController, dan retry logic dalam JavaScript modern.',
 'published'),

('Proyek Terbaru: Sistem Inventori Produk', 'Portofolio',
 'Membangun sistem inventori dengan Node.js, Express, dan MySQL.',
 'Isi lengkap artikel mengenai proyek sistem inventori produk yang saya kembangkan menggunakan Node.js, Express, dan MySQL dengan fitur CRUD lengkap.',
 'published'),

('Catatan Belajar React (Draft)', 'Tutorial',
 'Masih dalam proses penulisan, belum dipublikasikan.',
 'Draft catatan belajar React yang masih dalam proses penulisan dan belum siap dipublikasikan ke publik.',
 'draft');
