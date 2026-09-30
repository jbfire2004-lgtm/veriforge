import { trace, SpanStatusCode, type Span as OtelSpan } from "@opentelemetry/api";
import { Resource } from "@opentelemetry/resources";
import {
  BasicTracerProvider,
  BatchSpanProcessor,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import type {
  ObservabilityConfig,
  SpanAttributes,
  SpanStatus,
} from "./types";
import type { Span } from "./tracing";
import { TracingStub } from "./tracing";

let providerStarted = false;

/**
 * Initialize OTLP HTTP tracing when an exporter endpoint is configured.
 * Safe to call multiple times; no-op when endpoint empty.
 */
export function initOtlpTracing(config: ObservabilityConfig): boolean {
  if (!config.tracingEnabled || !config.otlpEndpoint) {
    return false;
  }
  if (providerStarted) return true;

  const url = config.otlpEndpoint.replace(/\/$/, "");
  const exporter = new OTLPTraceExporter({
    url: `${url}/v1/traces`,
  });

  const provider = new BasicTracerProvider({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: config.serviceName,
    }),
  });

  const processor =
    process.env.NODE_ENV === "test"
      ? new SimpleSpanProcessor(exporter)
      : new BatchSpanProcessor(exporter);
  provider.addSpanProcessor(processor);
  provider.register();
  providerStarted = true;
  return true;
}

/**
 * Tracing facade: keeps in-memory stub spans + emits OTel spans when OTLP is live.
 */
export class OtlpAwareTracing extends TracingStub {
  private readonly otelEnabled: boolean;
  private readonly serviceName: string;

  constructor(config: ObservabilityConfig) {
    super(config);
    this.serviceName = config.serviceName;
    this.otelEnabled = initOtlpTracing(config);
  }

  override startSpan(
    name: string,
    opts?: { parent?: Span; attributes?: SpanAttributes },
  ): Span {
    const span = super.startSpan(name, opts);
    if (this.otelEnabled) {
      const tracer = trace.getTracer("veri-agent-service");
      const otelSpan = tracer.startSpan(name, {
        attributes: {
          "service.name": this.serviceName,
          ...flattenAttrs(opts?.attributes),
        },
      });
      (span as Span & { _otel?: OtelSpan })._otel = otelSpan;
    }
    return span;
  }

  override addEvent(
    span: Span,
    name: string,
    attributes?: SpanAttributes,
  ): void {
    super.addEvent(span, name, attributes);
    const otel = (span as Span & { _otel?: OtelSpan })._otel;
    otel?.addEvent(name, flattenAttrs(attributes));
  }

  override setStatus(span: Span, status: SpanStatus, message?: string): void {
    super.setStatus(span, status, message);
    const otel = (span as Span & { _otel?: OtelSpan })._otel;
    if (!otel) return;
    otel.setStatus({
      code: status === "error" ? SpanStatusCode.ERROR : SpanStatusCode.OK,
      message,
    });
  }

  override end(span: Span): void {
    super.end(span);
    const otel = (span as Span & { _otel?: OtelSpan })._otel;
    otel?.end();
  }

  override async flushOtlp(): Promise<{
    exported: boolean;
    spanCount: number;
  }> {
    if (!this.otelEnabled) {
      return super.flushOtlp();
    }
    const count = this.recentSpans().length;
    try {
      const provider = trace.getTracerProvider() as {
        forceFlush?: () => Promise<void>;
      };
      if (typeof provider.forceFlush === "function") {
        await provider.forceFlush();
      }
    } catch {
      // collector may be down — do not throw
    }
    return { exported: true, spanCount: count };
  }
}

function flattenAttrs(
  attrs?: SpanAttributes,
): Record<string, string | number | boolean> {
  if (!attrs) return {};
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(attrs)) {
    if (
      typeof v === "string" ||
      typeof v === "number" ||
      typeof v === "boolean"
    ) {
      out[k] = v;
    } else if (v != null) {
      out[k] = String(v);
    }
  }
  return out;
}
