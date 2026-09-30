import type { NetworkContextInput } from "@vera/global-network";

const QUEUE_KEY = "vera-global-network-offline";

type QueueItem = {
  id: string;
  context: NetworkContextInput;
  queuedAt: string;
};

export function enqueueOfflineNetworkAnalyze(context: NetworkContextInput) {
  const queue = readQueue();
  queue.push({
    id: `net-${Date.now()}`,
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
