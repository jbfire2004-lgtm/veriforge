import { spawnSync } from 'node:child_process';

const smokeBaseUrl = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:3001';
const skipOnboarding = process.env.GO_LIVE_SKIP_ONBOARDING === '1';

const steps = [
  {
    name: 'Tenant onboarding seed',
    command: [process.execPath, 'scripts/onboard-tenant.mjs'],
    skip: skipOnboarding,
  },
  {
    name: 'Go-live smoke',
    command: [process.execPath, 'scripts/go-live-smoke.mjs'],
    env: {
      SMOKE_BASE_URL: smokeBaseUrl,
    },
  },
  {
    name: 'Synthetic probe',
    command: [process.execPath, 'scripts/synthetic-probe.mjs'],
    env: {
      SYNTHETIC_BASE_URL: process.env.SYNTHETIC_BASE_URL ?? smokeBaseUrl,
    },
  },
];

function runStep(step) {
  if (step.skip) {
    console.log(`- SKIP: ${step.name}`);
    return;
  }

  console.log(`\n▶ ${step.name}`);
  const [cmd, ...args] = step.command;
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: false,
    env: {
      ...process.env,
      ...step.env,
    },
  });

  if (result.status !== 0) {
    throw new Error(`Step failed: ${step.name}`);
  }
  console.log(`✓ ${step.name}`);
}

try {
  console.log('Vera go-live checklist starting...');
  console.log(`SMOKE_BASE_URL=${smokeBaseUrl}`);
  if (skipOnboarding) {
    console.log('GO_LIVE_SKIP_ONBOARDING=1 (onboarding step skipped)');
  }
  for (const step of steps) {
    runStep(step);
  }
  console.log('\n✅ go-live checklist complete');
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\n❌ go-live checklist failed: ${message}`);
  process.exit(1);
}
