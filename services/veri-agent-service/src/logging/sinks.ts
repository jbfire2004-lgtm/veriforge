import type { Logger } from "pino";
import type { AuditEvent, AuditQuery, AiUsageMetric } from "./types";
import { sanitizeAuditEvent } from "./create-audit-event";

export interface AuditSink {
  write(event: AuditEvent): void;
}

/**
 * Pino / stdout JSON sink — compatible with ELK, Datadog, CloudWatch log shippers.
 * Emits one structured JSON line per event via pino.
 */
export class PinoAuditSink implements AuditSink {
  constructor(private readonly log: Logger) {}

  write(event: AuditEvent): void {
    const safe = sanitizeAuditEvent(event);
    this.log.info(
      {
        ...safe,
        audit: true,
        // Datadog / ELK friendly facets
        "usr.id": safe.userId,
        "tenant.id": safe.companyId,
        "evt.name": safe.eventType,
        "evt.outcome": safe.outcome,
      },
      "veriagent.audit",
    );
  }
}

/**
 * In-memory sink for tests and optional local query.
 * Indexed by tenant, user, operation.
 */
export class MemoryAuditSink implements AuditSink {
  readonly events: AuditEvent[] = [];

  write(event: AuditEvent): void {
    this.events.push(sanitizeAuditEvent(event));
  }

  query(q: AuditQuery): AuditEvent[] {
    const limit = q.limit ?? 100;
    return this.events
      .filter((e) => (q.companyId == null ? true : e.companyId === q.companyId))
      .filter((e) => (q.userId == null ? true : e.userId === q.userId))
      .filter((e) =>
        q.operation == null ? true : e.operation === q.operation,
      )
      .filter((e) => (q.outcome == null ? true : e.outcome === q.outcome))
      .filter((e) => (q.from == null ? true : e.timestamp >= q.from))
      .filter((e) => (q.to == null ? true : e.timestamp <= q.to))
      .slice(-limit);
  }

  clear(): void {
    this.events.length = 0;
  }
}

/**
 * Anonymized AI usage metrics (counts/latency only — no prompts).
 */
export class AiUsageMetrics {
  private readonly buckets = new Map<string, AiUsageMetric>();

  record(event: AuditEvent): void {
    const key = `${event.companyId}|${event.operation}`;
    let m = this.buckets.get(key);
    if (!m) {
      m = {
        key,
        companyId: event.companyId,
        operation: event.operation,
        count: 0,
        successCount: 0,
        deniedCount: 0,
        failureCount: 0,
        totalLatencyMs: 0,
        imageSentCount: 0,
        fallbackCount: 0,
      };
      this.buckets.set(key, m);
    }
    m.count += 1;
    if (event.outcome === "success" || event.outcome === "allowed") {
      m.successCount += 1;
    } else if (event.outcome === "denied") {
      m.deniedCount += 1;
    } else if (event.outcome === "failure") {
      m.failureCount += 1;
    }
    if (typeof event.latencyMs === "number") {
      m.totalLatencyMs += event.latencyMs;
    }
    if (event.imageSent) m.imageSentCount += 1;
    if (event.fallback) m.fallbackCount += 1;
  }

  snapshot(): AiUsageMetric[] {
    return [...this.buckets.values()].map((m) => ({ ...m }));
  }

  clear(): void {
    this.buckets.clear();
  }
}

/** Fan-out to multiple sinks (pino + memory + future Datadog agent). */
export class CompositeAuditSink implements AuditSink {
  constructor(private readonly sinks: AuditSink[]) {}

  write(event: AuditEvent): void {
    const safe = sanitizeAuditEvent(event);
    for (const s of this.sinks) s.write(safe);
  }
}
