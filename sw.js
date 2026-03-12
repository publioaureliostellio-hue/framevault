const CACHE_NAME = 'framevault-cache-v3';
const OFFLINE_URL = '/index.html'; // Usiamo la home come pagina offline

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.2/babel.min.js',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Usiamo addAll e catch per non far fallire l'installazione se un link esterno salta
      return Promise.all(
        urlsToCache.map(url => {
          return cache.add(url).catch(reason => {
             console.log(`FrameVault: Errore cache su ${url} (ignorato per PWABuilder)`);
          });
        })
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Strategia Stale-While-Revalidate (La preferita da PWABuilder)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      }).catch(() => {
        // Se la rete fallisce e richiede HTML, restituisci l'index.html
        if (event.request.headers.get('accept').includes('text/html')) {
           return caches.match(OFFLINE_URL);
        }
      });
      return cachedResponse || fetchPromise;
    })
  );
});