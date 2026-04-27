const CACHE_NAME = 'imo-party-cache-v3';

// インストール時にキャッシュするのを「自身のファイルのみ」に限定し、タイムアウトによる失敗を防ぐ
const localUrls = [
  './',
  './index.html'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // 新しいバージョンをすぐに待機からアクティブへ
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(localUrls))
  );
});

self.addEventListener('activate', event => {
  // 古いバージョンのキャッシュを削除
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse; // キャッシュがあれば返す（オフライン時）
      }

      // キャッシュがなければネットワークから取得して、次回のために保存する
      return fetch(event.request).then(response => {
        // 正常なレスポンスのみ保存
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        
        return response;
      }).catch(error => {
        console.log('オフラインのため通信できませんでした:', event.request.url);
      });
    })
  );
});

### 手順3: インストールと「待機」（★ここが重要です）
1. スマホのホーム画面にある **現在のアプリを削除** します。
2. Safariなどの履歴やキャッシュを削除します。
3. GitHubページ（`https://TScode61.github.io/wordwolf/`）にアクセスします。
4. **⚠️画面が開いたら、何もせずにそのまま「10秒ほど」待ってください。**
   *(※この待っている間に、裏側で大きなプログラム達が確実にスマホ本体へ保存されます)*
5. 10秒待ったら、「ホーム画面に追加」を行ってください。
6. 追加したアプリを起動し、**ここでも5秒ほど待ってから**、タスクキル＆機内モードにして再度開けるかお試しください！
