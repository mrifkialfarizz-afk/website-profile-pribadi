let mapInstance = null;
let homeMarker = null;
let userMarker = null;
let userAccuracyCircle = null;

/** Lokasi domisili tetap (dipakai sebagai titik awal peta) — ganti sesuai kota Anda */
export const HOME_LOCATION = {
  lat: -7.642141,
  lng: 109.068410,
  label: 'Cilacap, Jawa Tengah',
};

/** Inisialisasi peta di dalam elemen dengan id tertentu. Aman dipanggil ulang (idempotent). */
export function initMap(containerId, { lat, lng, zoom = 13, label = '' } = HOME_LOCATION) {
  if (typeof L === 'undefined') {
    throw new Error('Library peta (Leaflet) belum termuat. Periksa koneksi internet.');
  }

  // Bersihkan instance lama (mis. saat navigasi SPA bolak-balik ke halaman ini)
  destroyMap();

  mapInstance = L.map(containerId, { scrollWheelZoom: false }).setView([lat, lng], zoom);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(mapInstance);

  homeMarker = L.marker([lat, lng]).addTo(mapInstance);
  if (label) homeMarker.bindPopup(label).openPopup();

  return mapInstance;
}

/** Tambah/perbarui marker lokasi pengguna (hasil Geolocation API) di peta yang sudah ada */
export function setUserMarker({ lat, lng, accuracy = 0 }, label = 'Lokasi Anda saat ini') {
  if (!mapInstance) return;

  if (userMarker) {
    userMarker.setLatLng([lat, lng]);
  } else {
    userMarker = L.marker([lat, lng], {
      icon: L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        className: 'user-marker',
      }),
    }).addTo(mapInstance);
  }
  userMarker.bindPopup(label).openPopup();

  if (userAccuracyCircle) {
    userAccuracyCircle.setLatLng([lat, lng]).setRadius(accuracy);
  } else if (accuracy) {
    userAccuracyCircle = L.circle([lat, lng], {
      radius: accuracy,
      color: '#0D9488',
      fillColor: '#0D9488',
      fillOpacity: 0.12,
      weight: 1,
    }).addTo(mapInstance);
  }

  mapInstance.setView([lat, lng], 15);
}

/** Hapus instance peta — dipanggil sebelum halaman lain dirender agar tidak memory-leak */
export function destroyMap() {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
    homeMarker = null;
    userMarker = null;
    userAccuracyCircle = null;
  }
}
