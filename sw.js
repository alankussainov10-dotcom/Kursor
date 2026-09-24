// Service Worker — DaraBala PWA v4 (force refresh)
const CACHE_NAME = 'darabala-v4';

const STATIC_FILES = [
  '/Kursor/',
  '/Kursor/index.html',
  '/Kursor/student/',
  '/Kursor/student/index.html',
  '/Kursor/teacher/',
  '/Kursor/teacher/index.html',
  '/Kursor/manifest.json',
  '/Kursor/icons/icon-192.png',
  '/Kursor/icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_FILES).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Не кэшируем API и внешние ресурсы
  if (url.hostname !== location.hostname) return;
  // Не кэшируем навигационные запросы — всегда свежие
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request).then(r => r || caches.match('/Kursor/student/index.html'))
      )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
