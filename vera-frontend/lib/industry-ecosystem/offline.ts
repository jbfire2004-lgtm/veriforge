import type { IndustryContextInput } from "@vera/industry-ecosystem";

const QUEUE_KEY = "vera-industry-ecosystem-offline";

type QueueItem = {
  id: string;
  context: IndustryContextInput;
  queuedAt: string;
};

export function enqueueOfflineOrchestrate(context: IndustryContextInput) {
  const queue = readQueue();
  queue.push({
    id: `eco-${Date.now()}`,
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
