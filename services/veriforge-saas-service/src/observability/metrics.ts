import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({
  register,
  prefix: 'veriforge_',
});

export const httpRequestDuration = new client.Histogram({
  name: 'veriforge_http_request_duration_seconds',
  help: 'API request latency in seconds',
  labelNames: ['method', 'route', 'status_code'] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

export const httpRequestsTotal = new client.Counter({
  name: 'veriforge_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'] as const,
  registers: [register],
});

export const httpErrorsTotal = new client.Counter({
  name: 'veriforge_http_errors_total',
  help: 'HTTP 5xx responses',
  labelNames: ['method', 'route', 'status_code'] as const,
  registers: [register],
});

export const workerJobDuration = new client.Histogram({
  name: 'veriforge_worker_job_duration_seconds',
  help: 'Background job duration in seconds',
  labelNames: ['worker_job'] as const,
  buckets: [0.1, 0.5, 1, 2, 5, 15, 30, 60, 120, 300],
  registers: [register],
});

export const workerJobRunsTotal = new client.Counter({
  name: 'veriforge_worker_job_runs_total',
  help: 'Background job runs by outcome',
  labelNames: ['worker_job', 'status'] as const,
  registers: [register],
});

export const trialExpiryOrgsTotal = new client.Counter({
  name: 'veriforge_trial_expiry_orgs_total',
  help: 'Organizations processed by trial expiry',
  labelNames: ['result'] as const,
  registers: [register],
});

export const trialNotificationsTotal = new client.Counter({
  name: 'veriforge_trial_notifications_total',
  help: 'Trial notification emails attempted/sent',
  labelNames: ['kind', 'result'] as const,
  registers: [register],
});

export const stripeWebhookProcessedTotal = new client.Counter({
  name: 'veriforge_stripe_webhook_processed_total',
  help: 'Stripe webhook events processed',
  labelNames: ['type', 'result'] as const,
  registers: [register],
});

export const stripeWebhookDuration = new client.Histogram({
  name: 'veriforge_stripe_webhook_duration_seconds',
  help: 'Stripe webhook handler duration',
  labelNames: ['type', 'result'] as const,
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register],
});

/** Approximate active DB pool usage signal (updated by health/ready). */
export const dbPoolSaturation = new client.Gauge({
  name: 'veriforge_db_pool_saturation_ratio',
  help: 'Estimated DB pool saturation 0-1 (from health probe / env)',
  registers: [register],
});

export const dbReady = new client.Gauge({
  name: 'veriforge_db_ready',
  help: '1 if last DB readiness check succeeded',
  registers: [register],
});

export function metricsRegistry(): client.Registry {
  return register;
}

export async function metricsText(): Promise<string> {
  return register.metrics();
}

export function normalizeRoute(path: string): string {
  return path
    .replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi,
      ':id',
    )
    .replace(/\/\d+/g, '/:id')
    .slice(0, 120) || '/';
}
