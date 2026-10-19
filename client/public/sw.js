const CACHE_NAME = 'vidnote-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install: cache assets and activate immediately
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Activate: clean up older cache versions and claim clients immediately
self.addEventListener('activate', (e) => {
  e.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      ),
      self.clients.claim(),
    ])
  );
});

// Fetch: Network-First for navigation (HTML), Stale-While-Revalidate for static assets
self.addEventListener('fetch', (e) => {
  const request = e.request;

  // For HTML / Navigation requests: Network-First with Cache fallback for instant auto-updates
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request) || caches.match('/index.html'))
    );
    return;
  }

  // For other requests (JS, CSS, images): Cache first with network fallback
  e.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && request.method === 'GET') {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return networkResponse;
      });
    })
  );
});