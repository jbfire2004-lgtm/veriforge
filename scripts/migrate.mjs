import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backend = path.join(root, "backend");
const backupScript = path.join(root, "scripts", "pre-migrate-backup.mjs");

if (process.env.MIGRATE_BACKUP_ON_DEPLOY === "1") {
  console.log("▶ running pre-migrate backup\n");
  execSync(`node "${backupScript}"`, {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
}

console.log("▶ prisma migrate deploy + generate\n");
execSync("npx prisma migrate deploy && npx prisma generate", {
  cwd: backend,
  stdio: "inherit",
  shell: true,
  env: process.env,
});
