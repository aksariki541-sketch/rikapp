const CACHE_STATIC_NAME = 'musifyrik-static-v7';
const CACHE_DATA_NAME = 'musifyrik-api-v7';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png',
  '/banner.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/theme.js',
  '/app.js',
  '/player.js',
  '/fullplayer.js',
  '/miniplayer.js',
  '/home.js',
  '/library.js',
  '/liked.js',
  '/search.js',
  '/album.js',
  '/artist.js',
  '/profile.js'
];

// External / CDN assets. These are fetched with `mode: 'no-cors'` so they are
// cached even without CORS headers (and served as opaque responses offline).
const CDN_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest'
];

// Install Event - Pre-cache Static Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then((cache) => {
      console.log('[SW] Pre-caching static assets');

      // 1. Cache the app shell (same-origin, readable responses)
      const shell = STATIC_ASSETS.map((url) => {
        return fetch(url).then((res) => {
          if (res.status === 200 || res.type === 'opaque') {
            return cache.put(url, res);
          }
        }).catch((err) => {
          console.warn('[SW] Failed to cache:', url, err);
        });
      });

      // 2. Cache CDN assets as opaque so they are available offline too.
      const cdn = CDN_ASSETS.map((url) => {
        return fetch(url, { mode: 'no-cors' }).then((res) => {
          if (res.type === 'opaque') {
            return cache.put(url, res);
          }
          return cache.put(url, res.clone());
        }).catch((err) => {
          console.warn('[SW] Failed to cache CDN asset:', url, err);
        });
      });

      return Promise.allSettled(shell.concat(cdn));
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean Up Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DATA_NAME) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fallback response used when everything else fails (never let respondWith
// resolve to `undefined`, otherwise the navigation fails with a network error).
function offlineShell() {
  return caches.match('/index.html', { ignoreSearch: true }).then((cached) => {
    if (cached) return cached;
    return caches.match('/', { ignoreSearch: true });
  }).then((cached) => {
    if (cached) return cached;
    return new Response(
      '<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MusifyRik - Offline</title></head><body style="background:#0d0d0c;color:#f5dfca;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;padding:24px;"><div><h1>MusifyRik</h1><p>Anda sedang offline. Coba lagi saat terhubung ke internet.</p></div></body></html>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  });
}

// Fetch Event - Handle Offline & Caching
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-GET requests or non-http(s) URLs
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Navigation requests -> Network first, fallback to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Keep the latest HTML cached so offline navigation always works
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_STATIC_NAME).then((cache) => {
              cache.put('/index.html', clone);
            });
          }
          return networkResponse;
        })
        .catch(() => offlineShell())
    );
    return;
  }

  // 2. API Routes -> Network first, save success to cache, fallback to cache on offline
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_DATA_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request, { ignoreSearch: true }).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Fallback JSON for offline API requests
            return new Response(
              JSON.stringify({ status: false, offline: true, message: 'Anda sedang offline (PWA Offline Mode)' }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }

  // 3. Static Assets (JS, PNG, WebP, CSS, Manifest, CDN scripts) -> Cache first, fallback to network
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch background update for cache freshness if online
        if (navigator.onLine) {
          fetch(request).then((networkResponse) => {
            if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
              const clone = networkResponse.clone();
              caches.open(CACHE_STATIC_NAME).then((cache) => {
                cache.put(request, clone);
              });
            }
          }).catch(() => {});
        }
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
          const clone = networkResponse.clone();
          caches.open(CACHE_STATIC_NAME).then((cache) => {
            cache.put(request, clone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // If an image fails offline, fall back to the cached logo
        if (request.headers.get('accept') && request.headers.get('accept').includes('image')) {
          return caches.match('/logo.png').then((logo) => {
            if (logo) return logo;
            return new Response('', { status: 200, headers: { 'Content-Type': 'image/png' } });
          });
        }
        // Never let respondWith resolve to `undefined` for static assets —
        // return an empty response so the page doesn't error out offline.
        return new Response('', {
          status: 200,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      });
    })
  );
});
