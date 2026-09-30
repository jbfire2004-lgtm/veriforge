import { context, trace, SpanStatusCode, type Span } from '@opentelemetry/api';
import { getCorrelationId } from './context';

const tracer = trace.getTracer('veriforge-saas-service');

export async function withSpan<T>(
  name: string,
  attrs: Record<string, string | number | boolean | undefined>,
  fn: (span: Span) => Promise<T>,
): Promise<T> {
  const correlationId = getCorrelationId();
  return tracer.startActiveSpan(name, async (span) => {
    try {
      if (correlationId) span.setAttribute('correlation.id', correlationId);
      for (const [k, v] of Object.entries(attrs)) {
        if (v !== undefined) span.setAttribute(k, v);
      }
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (err) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: err instanceof Error ? err.message : String(err),
      });
      span.recordException(err as Error);
      throw err;
    } finally {
      span.end();
    }
  });
}

export function currentTraceId(): string | undefined {
  const span = trace.getSpan(context.active());
  return span?.spanContext().traceId;
}
