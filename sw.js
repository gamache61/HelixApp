// HELIX SERVICE WORKER - v47.5 Resilient Build
const CACHE_NAME = 'helix-cache-v47.5'; 

const assetsToCache = [
  './',
  'index.html',
  'manifest.json'
];

// Install: Populates cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(assetsToCache))
  );
  self.skipWaiting(); // Forces the new version to take over immediately
});

// Activate: Purges old caches (v47.2, etc.)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  // Takes control of all open tabs immediately
  return self.clients.claim(); 
});

// Fetch: The "Network Error" Protector
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // RULE: Bypass cache entirely for API calls
  if (url.includes('googleapis.com') || url.includes('elevenlabs.io')) {
    return; // Browser handles these normally via network
  }

  // Otherwise, serve from cache with network fallback
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
