const mysql = require('mysql2/promise');
require('dotenv').config();

// Pool koneksi ke MySQL (default XAMPP: user root, password kosong)
// Saat deploy ke provider cloud (Railway/Clever Cloud/Aiven, dll), isi env
// DB_HOST/DB_USER/DB_PASSWORD/DB_NAME sesuai kredensial yang diberikan provider.
// Beberapa provider mewajibkan koneksi SSL — set DB_SSL=true di env jika diminta.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'profile_cms',
  waitForConnections: true,
  connectionLimit: 10,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

module.exports = pool;
