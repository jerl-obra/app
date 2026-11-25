/* Guarda las pantallas de la app para que abran sin señal. Los datos siempre se piden al servidor. */
const CACHE = 'jerl-obra-v1-2';
const ARCHIVOS = ['./', 'index.html', 'config.js', 'esquemas1.js', 'esquemas2.js', 'esquemas3.js', 'esquemas4.js', 'formularios.js', 'internos.js', 'nucleo.js', 'modulos1.js', 'modulos2.js', 'admin.js', 'logo.png', 'icono-192.png', 'icono-512.png', 'manifest.json'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
