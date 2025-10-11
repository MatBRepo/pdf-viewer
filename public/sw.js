const CACHE = "entriso-v1";
const APP_SHELL = ["/", "/manifest.webmanifest", "/favicon.ico", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

function shouldBypass(req) {
  const url = new URL(req.url);
  return (
    req.headers.get("accept")?.includes("application/pdf") ||
    url.pathname.endsWith(".pdf") ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/viewer/stream")
  );
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);

  if (shouldBypass(req)) return;

  // App navigation: network-first, fallback to cache
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((m) => m || caches.match("/")))
    );
    return;
  }

  // Static assets (Next chunks, icons, CSS/JS) → cache-first
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/_next/") || url.pathname.startsWith("/icons/") || url.pathname.endsWith(".css") || url.pathname.endsWith(".js"))
  ) {
    e.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }))
    );
  }
});
