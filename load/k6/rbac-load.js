/**
 * RBAC permission check load (authenticated).
 * Provide a valid access token via TOKEN env var.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 30,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<400'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3020';
const TOKEN = __ENV.TOKEN || '';
const ORG_ID = __ENV.ORG_ID || '';

export default function () {
  if (!TOKEN || !ORG_ID) {
    throw new Error('TOKEN and ORG_ID are required');
  }

  const res = http.get(`${BASE}/organizations/${ORG_ID}/trial`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });

  check(res, {
    'trial 200': (r) => r.status === 200,
  });

  // Cross-tenant probe should stay forbidden (use a random UUID)
  const forbidden = http.get(
    `${BASE}/organizations/00000000-0000-4000-8000-000000000099/trial`,
    { headers: { Authorization: `Bearer ${TOKEN}` } },
  );
  check(forbidden, {
    'cross-tenant 403': (r) => r.status === 403,
  });

  sleep(0.2);
}
