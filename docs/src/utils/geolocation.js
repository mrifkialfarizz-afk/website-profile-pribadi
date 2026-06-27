export function isGeolocationSupported() {
  return 'geolocation' in navigator;
}

/**
 * Minta posisi pengguna saat ini.
 * @returns {Promise<{lat:number, lng:number, accuracy:number}>}
 */
export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject(new Error('Geolocation API tidak didukung oleh browser ini.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        reject(mapGeolocationError(err));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options,
      }
    );
  });
}

/** Terjemahkan kode error Geolocation API ke pesan yang ramah pengguna */
function mapGeolocationError(err) {
  const messages = {
    1: 'Izin lokasi ditolak. Aktifkan izin lokasi di browser untuk melihat peta.',
    2: 'Lokasi tidak dapat ditentukan (sinyal GPS/jaringan tidak tersedia).',
    3: 'Permintaan lokasi melebihi batas waktu (timeout).',
  };
  return new Error(messages[err.code] || 'Gagal mendapatkan lokasi.');
}

/** Reverse geocoding sederhana lewat Nominatim (OpenStreetMap) — opsional, untuk nama tempat */
export async function reverseGeocode(lat, lng, signal) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`;
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Gagal mengambil nama lokasi.');
  const data = await res.json();
  return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}
