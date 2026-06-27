// Custom error class untuk error yang berasal dari respons API (status 4xx/5xx)
export class ApiError extends Error {
  constructor(message, status, payload = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

// Error khusus saat tidak ada koneksi / fetch gagal total (server mati, CORS, dll)
export class NetworkError extends Error {
  constructor(message = 'Tidak ada koneksi ke server') {
    super(message);
    this.name = 'NetworkError';
  }
}
