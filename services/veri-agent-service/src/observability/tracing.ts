import type {
  ObservabilityConfig,
  SpanAttributes,
  SpanStatus,
} from "./types";

export type Span = {
  name: string;
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  startMs: number;
  endMs?: number;
  status: SpanStatus;
  attributes: SpanAttributes;
  events: Array<{ name: string; ts: number; attributes?: SpanAttributes }>;
};

/**
 * Lightweight tracing stub mirroring OpenTelemetry span semantics.
 * Plug @opentelemetry/sdk-trace-node + OTLP exporter for production.
 */
export class TracingStub {
  private readonly spans: Span[] = [];

  constructor(private readonly config: ObservabilityConfig) {}

  startSpan(
    name: string,
    opts?: { parent?: Span; attributes?: SpanAttributes },
  ): Span {
    const span: Span = {
      name,
      traceId: opts?.parent?.traceId ?? randomId(32),
      spanId: randomId(16),
      parentSpanId: opts?.parent?.spanId,
      startMs: Date.now(),
      status: "ok",
      attributes: {
        "service.name": this.config.serviceName,
        ...opts?.attributes,
      },
      events: [],
    };
    if (this.config.tracingEnabled) {
      this.spans.push(span);
    }
    return span;
  }

  addEvent(span: Span, name: string, attributes?: SpanAttributes): void {
    if (!this.config.tracingEnabled) return;
    span.events.push({ name, ts: Date.now(), attributes });
  }

  setStatus(span: Span, status: SpanStatus, message?: string): void {
    span.status = status;
    if (message) span.attributes["otel.status_description"] = message;
  }

  end(span: Span): void {
    span.endMs = Date.now();
  }

  /**
   * Helper for pipeline stages: privacy → policy → orchestration.
   */
  async withSpan<T>(
    name: string,
    fn: (span: Span) => Promise<T>,
    opts?: { parent?: Span; attributes?: SpanAttributes },
  ): Promise<T> {
    const span = this.startSpan(name, opts);
    try {
      const result = await fn(span);
      this.setStatus(span, "ok");
      return result;
    } catch (err) {
      this.setStatus(
        span,
        "error",
        err instanceof Error ? err.message : "error",
      );
      throw err;
    } finally {
      this.end(span);
    }
  }

  /**
   * Stub OTLP export — returns serialized spans for debugging / future exporter.
   */
  async flushOtlp(): Promise<{ exported: boolean; spanCount: number }> {
    if (!this.config.tracingEnabled || !this.config.otlpEndpoint) {
      return { exported: false, spanCount: 0 };
    }
    return { exported: true, spanCount: this.spans.length };
  }

  recentSpans(limit = 50): Span[] {
    return this.spans.slice(-limit);
  }

  clear(): void {
    this.spans.length = 0;
  }
}

function randomId(hexLen: number): string {
  let s = "";
  for (let i = 0; i < hexLen; i++) {
    s += Math.floor(Math.random() * 16).toString(16);
  }
  return s;
}
