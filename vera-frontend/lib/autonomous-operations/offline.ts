const QUEUE_KEY = "vera-operations-offline-queue";

export type OfflineOperationsItem = {
  id: string;
  companyId: string;
  context: Record<string, unknown>;
  queuedAt: string;
};

export function enqueueOfflineOperations(item: Omit<OfflineOperationsItem, "id" | "queuedAt">) {
  const queue = readQueue();
  queue.push({
    ...item,
    id: `local-op-${Date.now()}`,
    queuedAt: new Date().toISOString(),
  });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function readQueue(): OfflineOperationsItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]") as OfflineOperationsItem[];
  } catch {
    return [];
  }
}

export function clearOperationsQueue() {
  if (typeof window !== "undefined") localStorage.removeItem(QUEUE_KEY);
}
