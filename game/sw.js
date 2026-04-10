// PNS Coffee Tree — Service Worker
// Network-first for HTML/JS/CSS (always fresh on deploy),
// cache-first for icons & manifest (static).
// IMPORTANT: bump CACHE_VERSION whenever the cache strategy or asset list changes.
const CACHE_VERSION = 'pns-coffee-tree-v3';
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './game.js',
  './manifest.json',
  './icon-192.svg',
  './icon-512.svg',
];

// 항상 네트워크 우선으로 가져올 자산 (배포마다 바뀌는 것)
function isNetworkFirstAsset(url) {
  return /\.(html|js|css)(\?|$)/i.test(url.pathname) || url.pathname.endsWith('/');
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Skip cross-origin (CDNs, Firebase, fonts)
  if (url.origin !== location.origin) return;

  // HTML 네비게이션: network-first, 실패 시 캐시
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(req, clone));
        return res;
      }).catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // game.js / style.css 등 자주 바뀌는 자산: network-first
  if (isNetworkFirstAsset(url)) {
    event.respondWith(
      fetch(req).then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, clone));
        }
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // 그 외 (아이콘, manifest.json 등): cache-first
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      if (res && res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(req, clone));
      }
      return res;
    }))
  );
});
