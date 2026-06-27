// article-api.js — Wrapper fetch untuk REST API backend
// Semua komunikasi frontend <-> backend (Async JavaScript) melewati modul ini.
import { BASE_URL } from '../config.js';
import { ApiError, NetworkError } from '../errors.js';

const API_URL = `${BASE_URL}/api/articles`;

// Helper request dasar (dipakai untuk GET/DELETE & request JSON biasa)
async function request(url, options = {}) {
  let res;
  try {
    res = await fetch(url, options);
  } catch (err) {
    if (err.name === 'AbortError') throw err; // teruskan abort apa adanya
    throw new NetworkError(err.message);
  }

  let data = null;
  try { data = await res.json(); } catch { /* bukan JSON, biarkan null */ }

  if (!res.ok) {
    const msg = data?.message || `HTTP ${res.status}`;
    throw new ApiError(msg, res.status, data);
  }
  return data;
}

// Retry logic dengan exponential backoff — hanya untuk NetworkError
async function retry(fn, retries = 3, delay = 500) {
  try {
    return await fn();
  } catch (err) {
    if (retries === 0 || !(err instanceof NetworkError)) throw err;
    console.warn(`Retry... sisa ${retries} percobaan`);
    await new Promise((r) => setTimeout(r, delay));
    return retry(fn, retries - 1, delay * 2); // 500ms -> 1s -> 2s
  }
}

/** Ambil semua artikel. params contoh: '?status=published&search=async' */
export function fetchArticles(params = '', signal) {
  return retry(() => request(`${API_URL}${params}`, { signal }));
}

/** Ambil satu artikel berdasarkan ID */
export function fetchArticle(id) {
  return retry(() => request(`${API_URL}/${id}`));
}

/** Ambil statistik dashboard */
export function fetchStats() {
  return retry(() => request(`${API_URL}/stats`));
}

/**
 * Buat artikel baru.
 * Menggunakan FormData karena thumbnail (jika ada) dikirim sebagai multipart/form-data —
 * PENTING: jangan set header 'Content-Type' manual, biarkan browser mengisi
 * boundary multipart secara otomatis.
 *
 * @param {{title,category,excerpt,content,status}} fields
 * @param {Blob|File|null} thumbnailFile - hasil capture kamera ATAU file yang dipilih user
 */
export async function createArticle(fields, thumbnailFile) {
  const form = buildFormData(fields, thumbnailFile);
  const data = await request(API_URL, { method: 'POST', body: form });
  return data.data;
}

/** Perbarui artikel. thumbnailFile boleh null jika tidak ganti foto. */
export async function updateArticle(id, fields, thumbnailFile) {
  const form = buildFormData(fields, thumbnailFile);
  const data = await request(`${API_URL}/${id}`, { method: 'PUT', body: form });
  return data.data;
}

/** Hapus artikel */
export async function deleteArticle(id) {
  return request(`${API_URL}/${id}`, { method: 'DELETE' });
}

function buildFormData(fields, thumbnailFile) {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => form.append(key, value ?? ''));
  // Field 'thumbnail' harus cocok dengan upload.single('thumbnail') di backend
  if (thumbnailFile) {
    form.append('thumbnail', thumbnailFile, thumbnailFile.name || 'thumbnail.png');
  }
  return form;
}
