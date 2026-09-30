import type { InterstellarContextInput } from "@vera/interstellar";

const QUEUE_KEY = "vera-interstellar-offline";

type QueueItem = { id: string; context: InterstellarContextInput; queuedAt: string };

export function enqueueOfflineExpand(context: InterstellarContextInput) {
  const queue = readQueue();
  queue.push({
    id: `is-${Date.now()}`,
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
