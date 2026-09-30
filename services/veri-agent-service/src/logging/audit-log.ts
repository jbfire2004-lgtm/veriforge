import type { Logger } from "pino";
import {
  fromLegacyAuditEvent,
  sanitizeAuditEvent,
} from "./create-audit-event";
import {
  AiUsageMetrics,
  CompositeAuditSink,
  MemoryAuditSink,
  PinoAuditSink,
  type AuditSink,
} from "./sinks";
import type {
  AuditEvent,
  AuditQuery,
  AiUsageMetric,
  LegacyAuditEvent,
} from "./types";
import {
  buildSafetyProvenance,
  parseSafetyOverlayMode,
} from "../safety";

let defaultSink: AuditSink | null = null;
let defaultMetrics: AiUsageMetrics | null = null;

export function setDefaultAuditSink(sink: AuditSink | null): void {
  defaultSink = sink;
}

export function getDefaultMetrics(): AiUsageMetrics {
  if (!defaultMetrics) defaultMetrics = new AiUsageMetrics();
  return defaultMetrics;
}

export function setDefaultMetrics(metrics: AiUsageMetrics | null): void {
  defaultMetrics = metrics;
}

/** Attach SAFETY-ENHANCED provenance when env overlay is on (no-op when off). */
function withSafetyOverlay(event: AuditEvent): AuditEvent {
  const mode = parseSafetyOverlayMode(process.env.VERA_AGENT_SAFETY_OVERLAY);
  const provenance = buildSafetyProvenance(String(event.operation), mode, {
    humanConfirmed: event.humanConfirmed,
  });
  if (!provenance) return event;
  return {
    ...event,
    ...provenance,
  };
}

/**
 * Emit a structured audit event (JSON via configured sinks).
 * Always sanitizes — never logs raw FLHA, images, prompts, or responses.
 */
export function auditLog(
  event: AuditEvent,
  sink?: AuditSink,
  metrics?: AiUsageMetrics,
): void {
  const safe = sanitizeAuditEvent(withSafetyOverlay(event));
  const target = sink ?? defaultSink;
  if (target) {
    target.write(safe);
  } else {
    // Fallback stdout JSON for environments without DI wiring
    // eslint-disable-next-line no-console
    console.info(JSON.stringify(safe));
  }
  (metrics ?? defaultMetrics)?.record(safe);
}

/**
 * High-level audit logger used by the service container.
 * Integrates pino (ELK/Datadog shippable) + optional in-memory query index.
 */
export class AuditLogger {
  private readonly sink: AuditSink;
  private readonly memory: MemoryAuditSink;
  private readonly metrics: AiUsageMetrics;

  constructor(
    log: Logger,
    options?: { memory?: MemoryAuditSink; metrics?: AiUsageMetrics },
  ) {
    this.memory = options?.memory ?? new MemoryAuditSink();
    this.metrics = options?.metrics ?? new AiUsageMetrics();
    this.sink = new CompositeAuditSink([
      new PinoAuditSink(log),
      this.memory,
    ]);
    setDefaultAuditSink(this.sink);
    setDefaultMetrics(this.metrics);
  }

  /** Canonical API */
  auditLog(event: AuditEvent): void {
    auditLog(event, this.sink, this.metrics);
  }

  /**
   * Legacy metadata-only record used by pipeline.
   * Accepts only the legacy shape — sensitive keys are stripped if present.
   */
  record(event: LegacyAuditEvent): void {
    this.auditLog(fromLegacyAuditEvent(event));
  }

  /** Query by tenant, user, and/or operation (in-process index). */
  query(q: AuditQuery): AuditEvent[] {
    return this.memory.query(q);
  }

  /** Anonymized AI usage metrics snapshot. */
  metricsSnapshot(): AiUsageMetric[] {
    return this.metrics.snapshot();
  }

  /** Test helper */
  getMemorySink(): MemoryAuditSink {
    return this.memory;
  }
}
