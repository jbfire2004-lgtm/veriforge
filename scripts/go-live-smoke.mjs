const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:3001';
const password = process.env.SMOKE_PASSWORD ?? 'hashedpassword123';
const adminEmail = process.env.SMOKE_ADMIN_EMAIL ?? 'admin@vera.com';

async function requestJson(path, options = {}) {
  const url = new URL(path, baseUrl).toString();
  const started = Date.now();
  const response = await fetch(url, options);
  const durationMs = Date.now() - started;
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Request failed ${url} status=${response.status} body=${body}`);
  }
  const json = await response.json();
  console.log(`smoke_ok endpoint=${path} durationMs=${durationMs}`);
  return json;
}

async function main() {
  await requestJson('/health');
  await requestJson('/ready');

  const login = await requestJson('/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password }),
  });
  const accessToken = login?.accessToken ?? login?.token;
  if (!accessToken) {
    throw new Error('Auth token missing from /auth/login response');
  }
  const authHeaders = { authorization: `Bearer ${accessToken}` };

  await requestJson('/auth/me', { headers: authHeaders });
  await requestJson('/audit?limit=5', { headers: authHeaders });

  // Hub/Core/PM/FieldOS backend smoke endpoints.
  await requestJson('/logging/stats');
  await requestJson('/incident');
  await requestJson('/map/workers');
  await requestJson('/map/equipment');
  await requestJson('/map/stations');
  await requestJson('/map/incidents');

  // VeriSuite SMS — engines, AI orchestrator, production health surface.
  const smsRaw = await requestJson('/api/v1/sms/health');
  const smsHealth = smsRaw?.data ?? smsRaw;
  if (smsHealth?.status !== 'ok' && smsHealth?.status !== 'degraded') {
    throw new Error(`SMS health unexpected status=${smsHealth?.status}`);
  }
  const engines = smsHealth?.engines ?? {};
  for (const key of [
    'industryBenchmark',
    'regionalDrilldown',
    'crossPageIntelligence',
    'aiOrchestrator',
  ]) {
    if (engines[key] !== 'ready') {
      throw new Error(`SMS engine not ready: ${key}=${engines[key]}`);
    }
  }
  if (!Array.isArray(smsHealth?.aiBehaviors) || smsHealth.aiBehaviors.length < 18) {
    throw new Error('SMS AI behavior catalog incomplete on /api/v1/sms/health');
  }
  const cfg = smsHealth?.config ?? {};
  if (cfg.monitoringEnabled === false) {
    throw new Error('SMS monitoring disabled — set SMS_MONITORING_ENABLED=1');
  }
  if (cfg.decisionLogging === false) {
    throw new Error('SMS AI decision logging disabled — set SMS_AI_DECISION_LOGGING=1');
  }
  console.log(
    `smoke_ok endpoint=/api/v1/sms/health engines=ready behaviors=${smsHealth.aiBehaviors.length} monitoring=${cfg.monitoringEnabled} aiDecisions=${cfg.decisionLogging} llm=${cfg.llmEnabled}`,
  );

  console.log('go_live_smoke_ok');
}

await main();
