import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backendDir = path.join(root, 'backend');

const run = (command) =>
  execSync(command, {
    cwd: backendDir,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });

console.log('▶ onboarding tenant baseline (core + practice company)');
run('npm run prisma:seed');
run('npm run seed:practice-company');
run('npm run seed:vera-core');
console.log('✅ onboarding seed automation complete');
