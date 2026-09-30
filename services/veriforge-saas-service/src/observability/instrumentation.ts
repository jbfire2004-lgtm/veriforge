/**
 * OpenTelemetry bootstrap — import this FIRST in index.ts / worker.ts
 * before other application modules.
 */
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

const enabled =
  process.env.OTEL_ENABLED === 'true' ||
  Boolean(process.env.OTEL_EXPORTER_OTLP_ENDPOINT);
const endpoint =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318/v1/traces';
const serviceName = process.env.OTEL_SERVICE_NAME ?? 'veriforge-saas-service';

let sdk: NodeSDK | null = null;

if (enabled) {
  if (process.env.OTEL_DIAG_LOG === 'true') {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
  }

  sdk = new NodeSDK({
    resource: new Resource({
      'service.name': serviceName,
      'service.version': process.env.npm_package_version ?? '1.0.0',
      'deployment.environment': process.env.NODE_ENV ?? 'development',
    }),
    traceExporter: new OTLPTraceExporter({
      url: endpoint,
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-dns': { enabled: false },
        '@opentelemetry/instrumentation-net': { enabled: false },
        '@opentelemetry/instrumentation-http': { enabled: true },
        '@opentelemetry/instrumentation-express': { enabled: true },
      }),
    ],
  });

  void sdk.start();

  const shutdown = async () => {
    try {
      await sdk?.shutdown();
    } catch {
      // ignore
    }
  };
  process.on('SIGTERM', () => void shutdown());
  process.on('SIGINT', () => void shutdown());
}

export function isOtelEnabled(): boolean {
  return enabled && sdk !== null;
}
