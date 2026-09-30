import type { CivilizationContextInput } from "@vera/civilization";

const QUEUE_KEY = "vera-civilization-offline";

type QueueItem = { id: string; context: CivilizationContextInput; queuedAt: string };

export function enqueueOfflineGovern(context: CivilizationContextInput) {
  const queue = readQueue();
  queue.push({
    id: `civ-${Date.now()}`,
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
