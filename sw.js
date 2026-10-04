/* 8 Health — service worker
   Estratégia:
   - arquivos do app: cache da versão instalada, inclusive HTML e scripts
   - a nova versão é baixada por inteiro na instalação e aguarda confirmação

   A versão nova NÃO assume sozinha: ela fica esperando enquanto o app mostra
   "Nova versão disponível". Quem manda ativar é o usuário, tocando em Atualizar
   (o app envia SKIP_WAITING). Assim nada é trocado no meio de um treino.

   Suba a constante VERSION a cada deploy para invalidar o cache antigo. */

const VERSION = "8health-v15";
const CACHE_PREFIX = "8health:" + self.registration.scope + ":";
const CACHE_NAME = CACHE_PREFIX + VERSION;
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./scripts/storage.js",
  "./scripts/progress.js",
  "./scripts/backup.js",
  "./scripts/plans.js",
  "./scripts/history.js",
  "./scripts/plan-fields.js",
  "./styles/layout.css",
  "./assets/favicon.png",
  "./assets/icon-1080.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const req = event.request;

  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== self.location.origin) return;

  const url = new URL(req.url);
  const arquivoDoApp = ASSETS.some(asset => new URL(asset, self.registration.scope).pathname === url.pathname);
  if (!arquivoDoApp) return;
  // O HTML nunca avança sozinho para uma versão incompatível com seus scripts.
  event.respondWith(caches.open(CACHE_NAME).then(async cache => {
    const hit = await cache.match(req, { ignoreSearch:true });
    if (hit) return hit;
    return fetch(req);
  }));
});
