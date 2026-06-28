const express = require('express');
const cors = require('cors');
const path = require('path');
const articleRoutes = require('./src/routes/articleRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sajikan file media (thumbnail artikel) secara statis
// Contoh: GET /uploads/1719999999-123456789.png
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/articles', articleRoutes);

app.get('/', (req, res) => {
  res.send('API CMS Artikel - Website Profil Pribadi (SPA) sedang berjalan.');
});

// Error handler global (menangani error dari Multer, mis. file > 5MB)
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Server backend berhasil berjalan!`);
  console.log(`🔗 API URL     : http://localhost:${PORT}`);
  console.log(`📂 Media URL   : http://localhost:${PORT}/uploads/<nama-file>`);
  console.log(`==================================================`);
  console.log(`💡 Perintah    : Tekan [Ctrl + C] untuk menghentikan server\n`);
});