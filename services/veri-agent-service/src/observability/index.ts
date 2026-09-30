import type { AppConfig } from "../config";
import { MetricsRegistry } from "./metrics";
import { TracingStub } from "./tracing";
import { OtlpAwareTracing } from "./otlp";
import type { ObservabilityConfig } from "./types";

export function loadObservabilityConfig(
  config: AppConfig,
  env: NodeJS.ProcessEnv = process.env,
): ObservabilityConfig {
  return {
    serviceName:
      config.OTEL_SERVICE_NAME ||
      env.OTEL_SERVICE_NAME ||
      "veri-agent-service",
    metricsEnabled: config.OTEL_METRICS_ENABLED !== false,
    tracingEnabled: config.OTEL_TRACING_ENABLED !== false,
    otlpEndpoint:
      config.OTEL_EXPORTER_OTLP_ENDPOINT ||
      env.OTEL_EXPORTER_OTLP_ENDPOINT ||
      undefined,
  };
}

export type Observability = {
  metrics: MetricsRegistry;
  tracing: TracingStub;
  config: ObservabilityConfig;
};

export function createObservability(config: AppConfig): Observability {
  const obsConfig = loadObservabilityConfig(config);
  const useOtlp = Boolean(obsConfig.otlpEndpoint && obsConfig.tracingEnabled);
  return {
    config: obsConfig,
    metrics: new MetricsRegistry(obsConfig),
    tracing: useOtlp
      ? new OtlpAwareTracing(obsConfig)
      : new TracingStub(obsConfig),
  };
}

export { MetricsRegistry } from "./metrics";
export { TracingStub } from "./tracing";
export type { Span } from "./tracing";
export { OtlpAwareTracing, initOtlpTracing } from "./otlp";
export { ALERT_RULES } from "./alerts";
export type { ObservabilityConfig, SpanAttributes } from "./types";
