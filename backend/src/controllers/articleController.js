const db = require('../config/db');
const { uploadBuffer, deleteByUrl } = require('../utils/cloudinaryHelper');

// GET /api/articles?search=&status=
exports.getAll = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = 'SELECT * FROM articles';
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(title LIKE ? OR category LIKE ? OR excerpt LIKE ?)');
      const keyword = `%${search}%`;
      params.push(keyword, keyword, keyword);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY created_at DESC';

    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/articles/stats  (HARUS didaftarkan SEBELUM /:id)
exports.getStats = async (req, res) => {
  try {
    const [[totalRow]] = await db.query('SELECT COUNT(*) AS total FROM articles');
    const [[publishedRow]] = await db.query(
      "SELECT COUNT(*) AS total FROM articles WHERE status = 'published'"
    );
    const [[draftRow]] = await db.query(
      "SELECT COUNT(*) AS total FROM articles WHERE status = 'draft'"
    );
    const [categoriesRow] = await db.query('SELECT DISTINCT category FROM articles');

    res.json({
      success: true,
      data: {
        total: totalRow.total,
        published: publishedRow.total,
        draft: draftRow.total,
        categories: categoriesRow.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/articles/:id
exports.getById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM articles WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Artikel tidak ditemukan' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/articles  (CREATE)
// Menerima multipart/form-data: field teks (title, category, dst) + opsional file 'thumbnail'
// req.body diisi Multer dari field teks, req.file diisi dari field file (jika ada, sbg Buffer di memori)
exports.create = async (req, res) => {
  try {
    const { title, category, excerpt, content, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Judul dan isi artikel wajib diisi' });
    }

    // Jika ada file yang diupload (dari kamera atau pilih file), upload ke Cloudinary
    // lalu simpan URL permanennya. Jika tidak ada, thumbnail_url tetap null.
    let thumbnailUrl = null;
    if (req.file) {
      const { url } = await uploadBuffer(req.file.buffer);
      thumbnailUrl = url;
    }

    const [result] = await db.query(
      `INSERT INTO articles (title, category, excerpt, content, thumbnail_url, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, category || 'Umum', excerpt || null, content, thumbnailUrl, status || 'draft']
    );

    const [rows] = await db.query('SELECT * FROM articles WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/articles/:id  (UPDATE)
exports.update = async (req, res) => {
  try {
    const { title, category, excerpt, content, status } = req.body;

    const [existing] = await db.query('SELECT * FROM articles WHERE id = ?', [req.params.id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Artikel tidak ditemukan' });
    }

    // Jika ada file baru diupload, upload ke Cloudinary & hapus foto lama di Cloudinary
    // (agar tidak menumpuk kuota). Jika tidak ada file baru, pertahankan thumbnail_url lama.
    let thumbnailUrl = existing[0].thumbnail_url;
    if (req.file) {
      if (thumbnailUrl) {
        await deleteByUrl(thumbnailUrl);
      }
      const { url } = await uploadBuffer(req.file.buffer);
      thumbnailUrl = url;
    }

    await db.query(
      `UPDATE articles
       SET title = ?, category = ?, excerpt = ?, content = ?, thumbnail_url = ?, status = ?
       WHERE id = ?`,
      [title, category, excerpt, content, thumbnailUrl, status, req.params.id]
    );

    const [rows] = await db.query('SELECT * FROM articles WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/articles/:id  (DELETE)
exports.remove = async (req, res) => {
  try {
    const [existing] = await db.query('SELECT * FROM articles WHERE id = ?', [req.params.id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Artikel tidak ditemukan' });
    }

    // Hapus juga foto thumbnail-nya dari Cloudinary jika ada
    if (existing[0].thumbnail_url) {
      await deleteByUrl(existing[0].thumbnail_url);
    }

    await db.query('DELETE FROM articles WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Artikel berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
