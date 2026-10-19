const C = "trascrivi-v2";

self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(["./", "./index.html"])).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith("trascrivi-") && k !== C).map(k => caches.delete(k))))
      .then(() => clients.claim())
  );
});

const store = (req, r) => {
  if (r.ok && r.status === 200) {
    const copy = r.clone();
    caches.open(C).then(c => c.put(req, copy)).catch(() => {});
  }
  return r;
};

self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (u.origin === location.origin) {
    // L'app: prima la rete (così gli aggiornamenti arrivano subito), la copia salvata solo offline
    e.respondWith(fetch(e.request).then(r => store(e.request, r)).catch(() => caches.match(e.request)));
  } else if (u.hostname === "cdn.jsdelivr.net") {
    // La libreria: dalla copia salvata, se c'è
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => store(e.request, r))));
  }
});
