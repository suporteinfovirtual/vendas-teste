// Service Worker para Best Ice Sorvetes PWA
const CACHE_NAME = 'best-ice-vendas-v1';
const urlsToCache = [
  '/vendas-teste/',
  '/vendas-teste/index.html',
  '/vendas-teste/manifest.json'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Cache criado');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('⚠️ Erro ao criar cache:', error);
      })
  );
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  // Apenas GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorar requisições para localhost e APIs externas
  if (event.request.url.includes('localhost') || event.request.url.includes('webuniplus.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se encontrou no cache, retorna
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          // Se não é uma resposta válida, retorna
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clona a resposta
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Se falhar, tenta retornar do cache
        return caches.match(event.request);
      })
  );
});
