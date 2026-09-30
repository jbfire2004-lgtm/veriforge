import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for pre-migrate backup.");
}

const backupDir = process.env.DB_BACKUP_DIR
  ? path.resolve(process.env.DB_BACKUP_DIR)
  : path.resolve(process.cwd(), "artifacts", "db-backups");
fs.mkdirSync(backupDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = path.join(backupDir, `vera-pre-migrate-${stamp}.dump`);

console.log(`▶ pg_dump backup: ${backupPath}`);
execSync(`pg_dump --format=custom --file="${backupPath}" "${databaseUrl}"`, {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

console.log("✅ pre-migrate backup complete");
