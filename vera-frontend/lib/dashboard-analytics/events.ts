import type { AnalyticsEvent, RevisionPayload } from "./types";

type Listener = (event: AnalyticsEvent) => void;

type EngineState = {
  revision: number;
  generatedAt: string;
  pendingInvalidation: boolean;
  lastEvent: AnalyticsEvent | null;
  listeners: Set<Listener>;
};

const g = globalThis as unknown as { __dashAnalyticsEngine?: EngineState };

function state(): EngineState {
  if (!g.__dashAnalyticsEngine) {
    g.__dashAnalyticsEngine = {
      revision: 1,
      generatedAt: new Date().toISOString(),
      pendingInvalidation: false,
      lastEvent: null,
      listeners: new Set(),
    };
  }
  return g.__dashAnalyticsEngine;
}

export function getAnalyticsRevision(): RevisionPayload {
  const s = state();
  return {
    revision: s.revision,
    generatedAt: s.generatedAt,
    pendingInvalidation: s.pendingInvalidation,
    lastEvent: s.lastEvent,
  };
}

export function subscribeAnalytics(listener: Listener) {
  const s = state();
  s.listeners.add(listener);
  return () => s.listeners.delete(listener);
}

/**
 * Broadcast a domain event. Domain stores should call this after mutating,
 * and may also listen to rebuild snapshots.
 */
export function emitAnalyticsEvent(
  eventName: string,
  meta?: Partial<Omit<AnalyticsEvent, "eventName" | "at">>,
): RevisionPayload {
  const s = state();
  const event: AnalyticsEvent = {
    eventName,
    domain: meta?.domain,
    scopeType: meta?.scopeType,
    scopeId: meta?.scopeId,
    at: new Date().toISOString(),
  };
  s.revision += 1;
  s.generatedAt = event.at;
  s.pendingInvalidation = true;
  s.lastEvent = event;
  for (const l of s.listeners) {
    try {
      l(event);
    } catch {
      /* ignore listener errors in preview */
    }
  }
  // Auto-clear pending after notify (stores rebuild synchronously in preview)
  s.pendingInvalidation = false;
  return getAnalyticsRevision();
}

export function clearPendingInvalidation() {
  state().pendingInvalidation = false;
}
