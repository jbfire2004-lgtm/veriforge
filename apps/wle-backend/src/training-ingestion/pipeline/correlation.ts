import { randomUUID } from 'crypto';

/** Correlation id for tracing ingestion steps across logs and audit rows. */
export function newIngestionCorrelationId(): string {
  return `ing_${randomUUID().replace(/-/g, '').slice(0, 20)}`;
}
