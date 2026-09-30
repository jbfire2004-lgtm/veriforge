const QUEUE_KEY = "vera-enterprise-offline-queue";

export type OfflineEnterpriseItem = {
  id: string;
  companyId: string;
  context: Record<string, unknown>;
  queuedAt: string;
};

export function enqueueOfflineEnterprise(item: Omit<OfflineEnterpriseItem, "id" | "queuedAt">) {
  const queue = readQueue();
  queue.push({
    ...item,
    id: `ent-local-${Date.now()}`,
    queuedAt: new Date().toISOString(),
  });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function readQueue(): OfflineEnterpriseItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]") as OfflineEnterpriseItem[];
  } catch {
    return [];
  }
}

export function clearEnterpriseQueue() {
  if (typeof window !== "undefined") localStorage.removeItem(QUEUE_KEY);
}
