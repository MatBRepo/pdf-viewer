// SW: cache app shell; NO PDF caching; handle Web Push
const CACHE = "entriso-shell-v1";
const APP_SHELL = ["/", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => { event.waitUntil(self.clients.claim()); });

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isPdfLike = url.pathname.endsWith(".pdf") || url.pathname.startsWith("/api/pdf/");
  if (isPdfLike) return; // do NOT intercept PDF streams
  if (event.request.method !== "GET") return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const res = await fetch(event.request);
      const cache = await caches.open(CACHE);
      const ct = res.headers.get("content-type") || "";
      if (res.ok && res.type === "basic" && (ct.includes("text/") || ct.includes("application/javascript"))) {
        cache.put(event.request, res.clone());
      }
      return res;
    } catch (e) {
      if (url.pathname === "/") return caches.match("/");
      throw e;
    }
  })());
});

// ---- Web Push ----
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch(e) {}
  const title = data.title || "Entriso";
  const body = data.body || "New update";
  const url = data.url || "/";
  const tag = data.tag || "entriso";
  const icon = "/icons/icon-192.png";
  event.waitUntil(
    self.registration.showNotification(title, { body, tag, icon, data: { url } })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(clients.matchAll({ type: "window" }).then(windowClients => {
    for (const client of windowClients) {
      if ("focus" in client) { client.navigate(url); return client.focus(); }
    }
    if (clients.openWindow) return clients.openWindow(url);
  }));
});
