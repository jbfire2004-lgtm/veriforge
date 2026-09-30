import type { MarketplaceContextInput } from "@vera/marketplace";

const QUEUE_KEY = "vera-marketplace-offline";

type QueueItem = { id: string; context: MarketplaceContextInput; queuedAt: string };

export function enqueueOfflineMarketplace(context: MarketplaceContextInput) {
  const queue = readQueue();
  queue.push({
    id: `mkt-${Date.now()}`,
    context: { ...context, offline: true },
    queuedAt: new Date().toISOString(),
  });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function readQueue(): QueueItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function clearQueue() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(QUEUE_KEY);
}
