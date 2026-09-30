/**
 * Register Vera offline service worker for background sync when supported.
 */
export function registerOfflineServiceWorker(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  void navigator.serviceWorker
    .register("/vera-offline-sw.js", { scope: "/" })
    .catch(() => undefined);
}

export function requestBackgroundSync(): void {
  if (typeof window === "undefined") return;
  void navigator.serviceWorker?.ready
    .then((reg) => {
      const syncManager = (reg as ServiceWorkerRegistration & {
        sync?: { register: (tag: string) => Promise<void> };
      }).sync;
      if (syncManager) {
        return syncManager.register("vera-offline-sync");
      }
      return undefined;
    })
    .catch(() => undefined);
}
