import type { InterplanetaryContextInput } from "@vera/interplanetary";

const QUEUE_KEY = "vera-interplanetary-offline";

type QueueItem = { id: string; context: InterplanetaryContextInput; queuedAt: string };

export function enqueueOfflineOperate(context: InterplanetaryContextInput) {
  const queue = readQueue();
  queue.push({
    id: `ip-${Date.now()}`,
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
