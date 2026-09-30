/* Vera offline service worker — triggers sync message when connectivity returns. */

const CACHE_NAME = "vera-offline-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("sync", (event) => {
  const syncEvent = event as ExtendableEvent & { tag?: string };
  if (syncEvent.tag === "vera-offline-sync") {
    syncEvent.waitUntil(notifyClientsToSync());
  }
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "VERA_SYNC_NOW") {
    void notifyClientsToSync();
  }
});

async function notifyClientsToSync(): Promise<void> {
  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  for (const client of clients) {
    client.postMessage({ type: "VERA_OFFLINE_SYNC" });
  }
}

self.addEventListener("fetch", (event) => {
  const request = (event as FetchEvent).request;
  if (request.method !== "GET") return;
  if (!request.url.includes("/api/v1/field/delta")) return;

  event.respondWith(
    fetch(request).catch(() =>
      caches.open(CACHE_NAME).then((cache) => cache.match(request)).then(
        (cached) => cached ?? new Response(JSON.stringify({ offline: true }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    ),
  );
});
