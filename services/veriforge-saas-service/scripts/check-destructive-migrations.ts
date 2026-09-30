/**
 * Pre-deployment gate: fail if pending migration SQL contains destructive ops
 * unless ALLOW_DESTRUCTIVE_MIGRATIONS=1.
 *
 * Usage:
 *   npx tsx scripts/check-destructive-migrations.ts
 *   npx tsx scripts/check-destructive-migrations.ts --pending-only
 */
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', 'prisma', 'migrations');
const ALLOW = process.env.ALLOW_DESTRUCTIVE_MIGRATIONS === '1';

const DESTRUCTIVE =
  /\b(DROP\s+TABLE|DROP\s+COLUMN|DROP\s+TYPE|TRUNCATE|ALTER\s+TYPE\b[\s\S]{0,80}\bDROP\s+VALUE|ALTER\s+TABLE\b[\s\S]{0,120}\bDROP\s+CONSTRAINT)\b/i;

const WARN =
  /\b(ALTER\s+COLUMN\b[\s\S]{0,80}\bTYPE\b|RENAME\s+(COLUMN|TO)|CREATE\s+UNIQUE\s+INDEX(?!\s+CONCURRENTLY))\b/i;

function listMigrationDirs(): string[] {
  if (!existsSync(ROOT)) return [];
  return readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

function main() {
  const dirs = listMigrationDirs();
  const findings: { migration: string; level: 'block' | 'warn'; match: string }[] = [];

  for (const name of dirs) {
    const sqlPath = join(ROOT, name, 'migration.sql');
    if (!existsSync(sqlPath)) continue;
    const sql = readFileSync(sqlPath, 'utf8');

    const drop = sql.match(DESTRUCTIVE);
    if (drop) {
      findings.push({ migration: name, level: 'block', match: drop[0] });
    }
    const warn = sql.match(WARN);
    if (warn) {
      findings.push({ migration: name, level: 'warn', match: warn[0] });
    }
  }

  for (const f of findings.filter((x) => x.level === 'warn')) {
    console.warn(`[warn] ${f.migration}: potential lock/risk → ${f.match.trim()}`);
  }

  const blockers = findings.filter((x) => x.level === 'block');
  if (blockers.length && !ALLOW) {
    console.error('\nDestructive migration statements detected:');
    for (const b of blockers) {
      console.error(`  - ${b.migration}: ${b.match.trim()}`);
    }
    console.error(
      '\nRefuse deploy. Expand into expand/contract online steps, or set ALLOW_DESTRUCTIVE_MIGRATIONS=1 after review.',
    );
    process.exit(1);
  }

  if (blockers.length && ALLOW) {
    console.warn('ALLOW_DESTRUCTIVE_MIGRATIONS=1 — proceeding despite destructive SQL.');
  }

  console.log(`Migration safety check OK (${dirs.length} migration folder(s)).`);
}

main();
