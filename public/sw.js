const CACHE_NAME = 'muti-v1';
const STATIC_ASSETS = [
  '/',
  '/icon-192x192.svg',
  '/icon-512x512.svg',
  '/og-image.svg',
  '/favicon-32x32.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if ((cacheName.startsWith('music-personality-') || cacheName.startsWith('muti-')) && cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

const isDynamicShareRequest = (url) => url.pathname === '/share' || url.pathname === '/result' || url.pathname.startsWith('/api/');

// Keep navigations fresh after deploys while retaining an offline home fallback.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;

  const url = new URL(event.request.url);
  if (isDynamicShareRequest(url)) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request).then((fetchResponse) => {
          if (fetchResponse.ok) {
            const responseClone = fetchResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return fetchResponse;
        });
      })
  );
});
