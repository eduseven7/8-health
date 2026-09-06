/* 8 Health — service worker
   Estratégia:
   - navegação e código (HTML/JSON/JS): network-first, com fallback para o cache offline
   - imagens e demais estáticos: cache-first
   Suba a versão abaixo a cada deploy para invalidar o cache antigo. */

const VERSION = "8health-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/favicon.png",
  "./assets/icon-1080.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(VERSION)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;

  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== self.location.origin) return;

  const aceita = req.headers.get("accept") || "";
  const dinamico = req.mode === "navigate" || aceita.includes("text/html") || /\.(html|json|js|css)$/.test(new URL(req.url).pathname);

  if (dinamico) {
    // network-first: sempre pega a versão nova quando há rede
    event.respondWith(
      fetch(req)
        .then(res => {
          const copia = res.clone();
          caches.open(VERSION).then(c => c.put(req, copia));
          return res;
        })
        .catch(() => caches.match(req).then(hit => hit || caches.match("./index.html")))
    );
    return;
  }

  // cache-first para imagens e afins
  event.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copia = res.clone();
      caches.open(VERSION).then(c => c.put(req, copia));
      return res;
    }))
  );
});
