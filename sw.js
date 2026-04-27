const CACHE_NAME = 'imo-party-cache-v2'; // バージョンを更新
const urlsToCache = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@500;800;900&display=swap',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js'
];

// インストール時に初期ファイルをキャッシュ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // 即座に新しいServiceWorkerを待機状態から有効にする
  );
});

// 古いキャッシュを削除して新しいものに更新
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// オフライン時にキャッシュからファイルを返す
self.addEventListener('fetch', event => {
  // ブラウザの拡張機能など、http/https以外のリクエストは無視する
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // キャッシュがあればそれを返す（オフライン時）
        if (response) return response;

        // キャッシュがなければネットワークから取得
        return fetch(event.request).then(response => {
          // CDNなどの外部リソース（CORSやOpaqueレスポンス）もキャッシュに保存するように条件を緩和
          if (!response || (response.status !== 200 && response.type !== 'opaque')) {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        }).catch(error => {
          console.log('オフラインのためネットワークリクエストに失敗しました:', event.request.url);
          // エラーでアプリがクラッシュしないようにする
        });
      })
  );
});
