/* 오프라인 캐시. 파일을 고친 뒤에는 아래 숫자를 올려야 새 버전이 반영됩니다. */
const CACHE = "trip-v8";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) {
        fetch(e.request).then(r => {
          if (r && r.ok) caches.open(CACHE).then(c => c.put(e.request, r.clone()));
        }).catch(() => {});
        return hit;
      }
      return fetch(e.request)
        .then(r => {
          if (r && r.ok) { const cl = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cl)); }
          return r;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
