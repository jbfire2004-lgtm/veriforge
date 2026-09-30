#!/usr/bin/env node
/**
 * VeriSuite SMS production gate — final security / compliance / performance audits
 * plus deploy checklist. Does not push images or mutate production unless
 * SMS_DEPLOY_PROMOTE=1 and release tooling is configured.
 *
 * Usage:
 *   node scripts/verisuite-sms-production-gate.mjs
 *   node scripts/verisuite-sms-production-gate.mjs --skip-frontend
 *   SMS_DEPLOY_PROMOTE=1 node scripts/verisuite-sms-production-gate.mjs  # checklist only + note
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const skipFrontend = process.argv.includes('--skip-frontend');
const skipBackend = process.argv.includes('--skip-backend');

const results = [];

function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  const mark = ok ? 'PASS' : 'FAIL';
  console.log(`${mark}  ${name}${detail ? ` — ${detail}` : ''}`);
}

function run(cmd, args, cwd, env = {}) {
  const r = spawnSync(cmd, args, {
    cwd,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    shell: false,
  });
  return {
    status: r.status ?? 1,
    stdout: r.stdout ?? '',
    stderr: r.stderr ?? '',
  };
}

console.log('═══════════════════════════════════════════════════════════');
console.log(' VeriSuite SMS — Production Gate');
console.log(' Security · Compliance · Performance · Deploy readiness');
console.log('═══════════════════════════════════════════════════════════\n');

// ── Env contract (static) ───────────────────────────────────────────────
const envEx = join(ROOT, '.env.production.example');
if (existsSync(envEx)) {
  const env = readFileSync(envEx, 'utf8');
  record(
    'Production env: SMS_MONITORING_ENABLED=1',
    /SMS_MONITORING_ENABLED=1/.test(env),
  );
  record(
    'Production env: SMS_AI_DECISION_LOGGING=1',
    /SMS_AI_DECISION_LOGGING=1/.test(env),
  );
  record(
    'Production env: SMS_LLM_ENABLED=0 (safe default)',
    /SMS_LLM_ENABLED=0/.test(env),
  );
  record(
    'Production env: ENABLE_ORIGIN_GUARD=1',
    /ENABLE_ORIGIN_GUARD=1/.test(env),
  );
} else {
  record('Production env example present', false, 'missing .env.production.example');
}

const mig = join(
  ROOT,
  'backend/prisma/migrations/20260717000000_verisuite_sms/migration.sql',
);
record('SMS Prisma migration present', existsSync(mig));

const runbook = join(ROOT, 'docs/verisuite-sms-production-deploy.md');
record('SMS production deploy runbook present', existsSync(runbook));

// ── Backend audits (Jest) ───────────────────────────────────────────────
if (!skipBackend) {
  console.log('\n▶ Backend SMS suite (includes go-live audits)…');
  const jestBin = join(ROOT, 'backend/node_modules/jest/bin/jest.js');
  const node = process.execPath;
  const r = run(
    node,
    [
      jestBin,
      '--runInBand',
      'src/verisuite-sms',
      '--testPathPattern=verisuite-sms',
    ],
    join(ROOT, 'backend'),
    { NODE_OPTIONS: '--max-old-space-size=4096' },
  );
  record(
    'Backend verisuite-sms tests',
    r.status === 0,
    r.status === 0 ? 'all green' : (r.stderr || r.stdout).slice(-400),
  );
} else {
  record('Backend verisuite-sms tests', true, 'skipped');
}

// ── Frontend smoke ──────────────────────────────────────────────────────
if (!skipFrontend) {
  console.log('\n▶ Frontend SMS smoke…');
  const vitest = join(ROOT, 'vera-frontend/node_modules/vitest/vitest.mjs');
  if (existsSync(vitest)) {
    const r = run(
      process.execPath,
      [vitest, 'run', 'tests/verisuite-sms.smoke.test.ts'],
      join(ROOT, 'vera-frontend'),
    );
    record(
      'Frontend SMS smoke',
      r.status === 0,
      r.status === 0 ? 'all green' : (r.stderr || r.stdout).slice(-400),
    );
  } else {
    record('Frontend SMS smoke', false, 'vitest not installed');
  }
} else {
  record('Frontend SMS smoke', true, 'skipped');
}

// ── Live smoke (optional) ───────────────────────────────────────────────
const smokeUrl = process.env.SMOKE_BASE_URL;
if (smokeUrl) {
  console.log(`\n▶ Live go-live smoke against ${smokeUrl}…`);
  const r = run(process.execPath, [join(ROOT, 'scripts/go-live-smoke.mjs')], ROOT, {
    SMOKE_BASE_URL: smokeUrl,
  });
  record('Go-live smoke (live)', r.status === 0, smokeUrl);
} else {
  record(
    'Go-live smoke (live)',
    true,
    'skipped — set SMOKE_BASE_URL to hit a running stack',
  );
}

// ── Promote note ────────────────────────────────────────────────────────
const promote = process.env.SMS_DEPLOY_PROMOTE === '1';
if (promote) {
  record(
    'Image promote',
    false,
    'SMS_DEPLOY_PROMOTE=1 set but automated GHCR promote requires git tag vX.Y.Z + secrets — run release-images.yml manually',
  );
} else {
  record(
    'Image promote',
    true,
    'not requested — tag vX.Y.Z to publish via .github/workflows/release-images.yml',
  );
}

// ── Summary ─────────────────────────────────────────────────────────────
const failed = results.filter((r) => !r.ok);
console.log('\n═══════════════════════════════════════════════════════════');
console.log(` Results: ${results.length - failed.length}/${results.length} passed`);
if (failed.length) {
  console.log(' Failures:');
  for (const f of failed) console.log(`  - ${f.name}: ${f.detail}`);
  console.log('\nPRODUCTION GATE FAILED');
  process.exit(1);
}

console.log(`
PRODUCTION GATE PASSED

Deploy next (human / CI):
  1. Ensure secrets match .env.production.example (SMS_* flags on)
  2. git tag vX.Y.Z && git push origin vX.Y.Z  → release-images.yml
  3. Deploy images to stage → migrate 20260717000000_verisuite_sms
  4. SMOKE_BASE_URL=https://stage-api… node scripts/go-live-smoke.mjs
  5. Promote unchanged tags to production
  6. Verify GET /api/v1/sms/health (engines ready, 18 behaviors)
  7. POST /api/v1/sms/ops/alert-test (if SMS_ALERT_WEBHOOK_URL set)

Ships in vera-backend / vera-frontend monolith:
  · Industry benchmarking · Regional drilldown · Cross-page intelligence
  · AI-01…18 orchestrator · VeriPM / VeriCore / FieldOS / VeriHub hubs
`);
process.exit(0);
