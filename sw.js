/*
 * Service worker do painel SIGA (PWA).
 * Autor: Junior | Data/Hora: 13/10/2026 16:56
 *
 * - Página (navegação): rede primeiro, pra cada publicação aparecer na hora; sem rede,
 *   usa a última cópia salva — o painel abre offline.
 * - Ícones e manifest: cache primeiro (quase nunca mudam).
 * - Outros domínios (Apps Script, claude.ai): não passam pelo cache — o estado dos
 *   checklists tem que vir sempre fresco.
 * Mudou a lista de arquivos? Suba a VERSAO pra descartar o cache antigo.
 */
var VERSAO = 'siga-painel-v1';
var ARQUIVOS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', function (evento) {
  evento.waitUntil(caches.open(VERSAO).then(function (cache) { return cache.addAll(ARQUIVOS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (evento) {
  evento.waitUntil(caches.keys().then(function (nomes) {
    return Promise.all(nomes.filter(function (n) { return n !== VERSAO; })
      .map(function (n) { return caches.delete(n); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function (evento) {
  var req = evento.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    evento.respondWith(fetch(req).then(function (resp) {
      var copia = resp.clone();
      caches.open(VERSAO).then(function (cache) { cache.put('index.html', copia); });
      return resp;
    }).catch(function () { return caches.match('index.html'); }));
    return;
  }

  evento.respondWith(caches.match(req).then(function (salvo) { return salvo || fetch(req); }));
});
