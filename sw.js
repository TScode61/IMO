const CACHE_NAME = 'imo-party-cache-v1';
// キャッシュするファイルのリスト（外部ライブラリなども含む）
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

// インストール時にファイルをキャッシュする
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// ネットワークリクエストをインターセプトしてキャッシュから返す
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // キャッシュにデータがあればそれを返す
        if (response) {
          return response;
        }
        // なければネットワークから取得し、キャッシュに保存してから返す
        return fetch(event.request).then(
          function(response) {
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            var responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
            return response;
          }
        );
      })
  );
});

5. 貼り付けたら、画面右上の緑色のボタン「**Commit changes...**」をクリックして保存します。

---

### 手順3: スマホで再インストールする
GitHubの設定が反映されるまで2〜3分ほど待ちます。
キャッシュの仕組みが変わるため、**現在ホーム画面にあるアプリを一度削除**してください。

その後、SafariやChromeで再びURL（`https://TScode61.github.io/wordwolf/`）にアクセスし、ページが完全に読み込まれてから、もう一度「ホーム画面に追加」を行ってください。

追加後、機内モード（Wi-Fiとモバイル通信をオフ）にしてからアプリを起動し、問題なく表示・動作すれば完全なオフライン対応の成功です！
