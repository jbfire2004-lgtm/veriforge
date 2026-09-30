/**
 * Optional k6 load tests for VeriForge API.
 *
 * Usage:
 *   k6 run -e BASE_URL=http://localhost:3020 load/k6/pricing-load.js
 *   k6 run -e BASE_URL=http://localhost:3020 -e TOKEN=eyJ... load/k6/rbac-load.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 20,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3020';

export default function () {
  const res = http.post(
    `${BASE}/pricing/quote`,
    JSON.stringify({
      modules: ['vericore', 'veripm'],
      billingCycle: 'monthly',
      currency: 'USD',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  check(res, {
    'quote 200': (r) => r.status === 200,
    'has total': (r) => {
      try {
        return JSON.parse(String(r.body)).selectedCycleTotalCents > 0;
      } catch {
        return false;
      }
    },
  });

  sleep(0.3);
}
