const CACHE_NAME = 'vidnote-v6';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener('fetch', (e) => {
  const request = e.request;

  // Never intercept backend API requests
  if (request.url.includes('/api/')) {
    return;
  }

  // Network-first for all requests, fallback to cache if offline
  e.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && request.method === 'GET') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});