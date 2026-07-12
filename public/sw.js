const CACHE_NAME_PREFIX = 'hadalbore_lab-core-cache-';
const BASE_VERSION = '169b66aa6dd245_a892134';
let activeCacheName = CACHE_NAME_PREFIX + BASE_VERSION;

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './favicon.svg',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install Event: cache static shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(activeCacheName).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event: clean deprecated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== activeCacheName && cache.startsWith(CACHE_NAME_PREFIX)) {
            console.log('[SW] Deleting deprecated mixed-schema cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Caching helper strategies
const isUIAsset = (url) => {
  const path = url.pathname;
  return path === '/' ||
         path === '/index.html' ||
         path === '/manifest.json' ||
         path.endsWith('.css') ||
         path.endsWith('.js') ||
         path.endsWith('.svg') ||
         path.endsWith('.png') ||
         path.endsWith('.ico') ||
         url.hostname.includes('fonts.googleapis.com') ||
         url.hostname.includes('fonts.gstatic.com');
};

const isDataSnapshot = (url) => {
  const path = url.pathname;
  return path.includes('/assets/diagrams/') || path.endsWith('.json') || path.includes('/api/');
};

// Fetch Event: Cache First for UI, Stale While Revalidate for Data, Network First for Updates
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return;

  const url = new URL(event.request.url);

  // Bypass service worker caching on localhost/127.0.0.1 for seamless development
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return;
  }

  // 1. UI Assets -> CACHE FIRST
  if (isUIAsset(url)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(activeCacheName).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
  }
  // 2. Data Snapshots -> STALE WHILE REVALIDATE
  else if (isDataSnapshot(url)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(activeCacheName).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => {
          // Silent catch for network disconnect during stale-while-revalidate background fetches
        });
        return cachedResponse || fetchPromise;
      })
    );
  }
  // 3. Sync & Other -> NETWORK FIRST (with cache rollback)
  else {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(activeCacheName).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
          });
        })
    );
  }
});

// Message Listener for update lifecycle and atomic cache swaps
self.addEventListener('message', (event) => {
  if (event.data) {
    if (event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    } else if (event.data.type === 'LOCK_CACHE_VERSION' && event.data.hash) {
      const newCacheName = CACHE_NAME_PREFIX + event.data.hash;
      if (activeCacheName !== newCacheName) {
        console.log(`[SW] Atomic Cache Swap initiated: ${activeCacheName} -> ${newCacheName}`);
        
        // Force atomic cache swap: clone existing assets to new cache first, then delete old cache
        event.waitUntil(
          caches.open(newCacheName).then((newCache) => {
            return caches.open(activeCacheName).then((oldCache) => {
              return oldCache.keys().then((requests) => {
                const promises = requests.map((req) => {
                  return oldCache.match(req).then((res) => {
                    if (res) return newCache.put(req, res);
                  });
                });
                return Promise.all(promises);
              });
            });
          }).then(() => {
            const oldCacheName = activeCacheName;
            activeCacheName = newCacheName;
            caches.delete(oldCacheName);
            console.log('[SW] Atomic Cache Swap complete. Locked to version hash:', event.data.hash);
          }).catch((err) => {
            console.error('[SW] Cache swap failed. Rolling back to safe cache version:', activeCacheName, err);
          })
        );
      }
    }
  }
});
