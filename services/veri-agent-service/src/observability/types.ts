/** OpenTelemetry-compatible observability stubs for VeriAgent. */

export type SpanStatus = "ok" | "error";

export type SpanAttributes = Record<string, string | number | boolean | undefined>;

export type MetricLabels = Record<string, string>;

export type ObservabilityConfig = {
  serviceName: string;
  metricsEnabled: boolean;
  tracingEnabled: boolean;
  /** OTLP HTTP endpoint (stub — plug real exporter later) */
  otlpEndpoint?: string;
};
