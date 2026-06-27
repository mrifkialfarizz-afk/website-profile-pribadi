// camera.js — Pembungkus Media Stream API & Canvas API
// Dipakai di halaman Admin untuk mengambil foto thumbnail artikel langsung dari kamera.

/**
 * Mulai kamera dan tampilkan live preview di elemen <video>.
 * @param {HTMLVideoElement} videoEl
 * @param {'user'|'environment'} facingMode - 'user' = depan, 'environment' = belakang
 * @returns {Promise<MediaStream>}
 */
export async function startCamera(videoEl, facingMode = 'environment') {
  // getUserMedia meminta izin akses kamera ke browser (akan memunculkan dialog izin)
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode,
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: false, // tidak butuh mikrofon
  });

  // PENTING: gunakan srcObject untuk MediaStream, bukan src (itu untuk URL file)
  videoEl.srcObject = stream;
  return stream;
}

/**
 * Hentikan SEMUA track pada stream — wajib dipanggil saat meninggalkan
 * halaman kamera agar lampu indikator mati & resource dibebaskan.
 * @param {MediaStream|null} stream
 */
export function stopCamera(stream) {
  stream?.getTracks().forEach((track) => track.stop());
}

/**
 * Ambil satu frame dari video ke dalam <canvas>, opsional terapkan filter grayscale.
 * @param {HTMLVideoElement} videoEl
 * @param {{grayscale?: boolean}} options
 * @returns {HTMLCanvasElement}
 */
export function captureFrame(videoEl, { grayscale = false } = {}) {
  const canvas = document.createElement('canvas');
  // Set ukuran canvas = resolusi asli video, agar tidak kehilangan kualitas
  canvas.width = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

  if (grayscale) applyGrayscale(ctx, canvas);
  return canvas;
}

/** Manipulasi piksel: rata-ratakan R,G,B agar gambar menjadi abu-abu */
function applyGrayscale(ctx, canvas) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data; // [R,G,B,A, R,G,B,A, ...]

  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = avg;
    data[i + 1] = avg;
    data[i + 2] = avg;
    // data[i + 3] = alpha, tidak diubah
  }
  ctx.putImageData(imageData, 0, 0);
}

/** Konversi <canvas> menjadi Blob (asinkron, dibungkus jadi Promise) */
export function canvasToBlob(canvas, type = 'image/png', quality) {
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), type, quality));
}

/**
 * Unduh sebuah Blob sebagai file ke perangkat pengguna.
 * @param {Blob} blob
 * @param {string} filename
 */
export function downloadBlob(blob, filename = 'gambar.png') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url); // wajib: bebaskan memori setelah dipakai
}

/** Daftar semua perangkat kamera yang terpasang (untuk dropdown pilih kamera, opsional) */
export async function listCameras() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((d) => d.kind === 'videoinput');
}
