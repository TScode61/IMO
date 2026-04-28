// IMO Service Worker
// 仕様書「3.② オフライン対応・PWA関連」の教訓に基づく実装：
// - install時の一括事前キャッシュは行わない（重い外部ファイルが1つでも失敗すると全滅するため）
// - fetchイベントで動的にキャッシュを追加する
// - CDN（cors/opaque）応答もキャッシュ対象にする（このアプリはReact/Tailwind/Babel/SortableJS/Google FontsをCDN依存）

const CACHE = "imo-v3";
const CORE_ASSETS = ["./", "./index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // chrome-extension: 等は対象外
  const url = new URL(req.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          // 同一オリジン(basic) / CORS / no-cors(opaque, status=0) のいずれもキャッシュする
          if (res && (res.ok || res.type === "opaque")) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => {
          // オフラインでナビゲーション時はindex.htmlにフォールバック
          if (req.mode === "navigate") return caches.match("./index.html");
        });
    })
  );
});
