const QUEUE_KEY = "vera-command-center-offline";

export function enqueueOfflineRefresh(companyId: string, context: Record<string, unknown>) {
  const queue = readQueue();
  queue.push({
    id: `cc-${Date.now()}`,
    companyId,
    context,
    queuedAt: new Date().toISOString(),
  });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function readQueue() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]");
  } catch {
    return [];
  }
}
