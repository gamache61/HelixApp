/**
 * HELIX SERVICE WORKER - Version 48.8
 * * INSTRUCTIONS FOR UPDATING:
 * 1. Change the version number in CACHE_NAME (e.g., v48.8 to v48.9)
 * 2. Save the file.
 * 3. Refresh your Helix app twice.
 */

const CACHE_NAME = 'helix-cache-v48.8';

// This list ensures every part of your app is saved for offline use
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './sw.js'
];

// 1. INSTALL: Creates the cache and stores the files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Helix: Opening Cache and storing assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // This forces the updated service worker to take over immediately
  self.skipWaiting();
});

// 2. ACTIVATE: Deletes the old "wrong" versions of the app
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Helix: Clearing old cache version:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  // Ensures the updated logic is used right away across all open tabs
  return self.clients.claim();
});

// 3. FETCH: Serves the app from the cache so it's fast and works offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return the cached version if we have it, otherwise get it from the web
      return response || fetch(event.request);
    })
  );
});