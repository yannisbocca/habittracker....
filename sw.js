// Permet d'ouvrir l'app sans réseau. Fichiers du site : réseau d'abord (les mises à jour arrivent), cache si hors ligne.
// SDK Firebase (versionné, ne change jamais) : cache d'abord.
const CACHE = 'habitudes-v1';
const FILES = ['./', 'index.html', 'config.js', 'manifest.json', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'favicon-32.png'];

self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); });
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

const keep = (req, res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; };

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sdk = url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/');
  if (url.origin !== location.origin && !sdk) return; // connexion Google et Firestore : jamais en cache
  e.respondWith(sdk
    ? caches.match(req).then(hit => hit || fetch(req).then(res => keep(req, res)))
    : fetch(req).then(res => keep(req, res))
        .catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('index.html'))));
});
