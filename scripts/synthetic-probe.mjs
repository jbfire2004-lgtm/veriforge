const baseUrl = process.env.SYNTHETIC_BASE_URL;

if (!baseUrl) {
  throw new Error('SYNTHETIC_BASE_URL is required');
}

const endpoints = ['/health', '/ready', '/health/synthetic', '/api/v1/sms/health'];

for (const endpoint of endpoints) {
  const url = new URL(endpoint, baseUrl).toString();
  const started = Date.now();
  const response = await fetch(url, {
    headers: {
      'x-correlation-id': `synthetic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    },
  });
  const durationMs = Date.now() - started;
  if (!response.ok) {
    throw new Error(`Probe failed for ${url} (${response.status})`);
  }
  console.log(`probe_ok endpoint=${endpoint} status=${response.status} durationMs=${durationMs}`);
}

console.log('synthetic_probe_ok');
