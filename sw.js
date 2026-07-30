// v2 — cache dibersihkan & sekarang selalu diperbarui setiap kali online,
// jadi versi offline tidak lagi "membeku" di versi lama.
const CACHE = 'leslesanku-v2';
const FILES = ['./'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return; // jangan cache request selain GET

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Setiap kali berhasil ambil dari internet (online), simpan salinan
        // TERBARU ini ke cache. Jadi cache selalu "versi terakhir yang online",
        // bukan snapshot beku dari saat sw.js pertama kali di-install.
        const resClone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, resClone));
        return res;
      })
      .catch(() => caches.match(e.request)) // offline → pakai cache terbaru yang tersimpan
  );
});
