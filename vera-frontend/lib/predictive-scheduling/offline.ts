const QUEUE_KEY = "vera-scheduling-offline-queue";

export type OfflineScheduleItem = {
  id: string;
  companyId: string;
  context: Record<string, unknown>;
  queuedAt: string;
};

export function enqueueOfflineSchedule(item: Omit<OfflineScheduleItem, "id" | "queuedAt">) {
  const queue = readQueue();
  queue.push({
    ...item,
    id: `local-${Date.now()}`,
    queuedAt: new Date().toISOString(),
  });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function readQueue(): OfflineScheduleItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]") as OfflineScheduleItem[];
  } catch {
    return [];
  }
}

export function clearQueue() {
  if (typeof window !== "undefined") localStorage.removeItem(QUEUE_KEY);
}
