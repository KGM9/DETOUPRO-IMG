const CACHE_NAME = 'detourpro-v1';
const ASSETS_TO_CACHE = [
    'index.html',
    'style.css',
    'app.js',
    'manifest.json'
];

// Installation du Service Worker et mise en cache des actifs essentiels
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Stratégie réseau d'abord, secours sur le cache si hors-ligne
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});