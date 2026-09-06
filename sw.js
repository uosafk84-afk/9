const CACHE_NAME = "spinghar-orders-cache-v10";
const ASSETS = [
  "./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png",
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js",
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js",
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js",
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const isPage = event.request.mode === "navigate" || event.request.url.endsWith("index.html") || event.request.url.endsWith("/");
  if (isPage) {
    // Network-first for the app page itself, so new deploys always show up immediately.
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  // Cache-first for static assets (icons, libraries) that rarely change.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            return response;
          })
          .catch(() => cached)
      );
    })
  );
});
