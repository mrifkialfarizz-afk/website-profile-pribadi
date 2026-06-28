// cloudinaryHelper.js — Bantuan upload/hapus foto dari/ke Cloudinary

const cloudinary = require('../config/cloudinary');

/**
 * Upload buffer gambar (hasil Multer memoryStorage) ke Cloudinary.
 * @param {Buffer} buffer - isi file gambar
 * @returns {Promise<{url: string, publicId: string}>}
 */
function uploadBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'profile-cms-articles' }, // folder khusus di akun Cloudinary
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

/**
 * Hapus gambar dari Cloudinary berdasarkan URL yang tersimpan di database.
 * Public ID diekstrak dari URL (termasuk folder), karena kita tidak
 * menyimpan kolom publicId terpisah di tabel articles.
 * Contoh URL: https://res.cloudinary.com/xxx/image/upload/v123/profile-cms-articles/abcde.jpg
 * Public ID-nya: profile-cms-articles/abcde
 */
async function deleteByUrl(url) {
  if (!url || !url.includes('res.cloudinary.com')) return; // bukan foto Cloudinary, abaikan
  try {
    const afterUpload = url.split('/upload/')[1]; // "v123/profile-cms-articles/abcde.jpg"
    const withoutVersion = afterUpload.replace(/^v\d+\//, ''); // "profile-cms-articles/abcde.jpg"
    const publicId = withoutVersion.replace(/\.[a-zA-Z0-9]+$/, ''); // hilangkan ekstensi
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn('[Cloudinary] Gagal menghapus gambar lama:', err.message);
  }
}

module.exports = { uploadBuffer, deleteByUrl };
