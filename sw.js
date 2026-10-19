const C = "trascrivi-v1";

self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(["./", "./index.html"])).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => e.waitUntil(clients.claim()));

self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  const ok = u.origin === location.origin || u.hostname === "cdn.jsdelivr.net";
  if (e.request.method !== "GET" || !ok) return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
      if (r.ok && r.status === 200) {
        const copy = r.clone();
        caches.open(C).then(c => c.put(e.request, copy)).catch(() => {});
      }
      return r;
    }))
  );
});
