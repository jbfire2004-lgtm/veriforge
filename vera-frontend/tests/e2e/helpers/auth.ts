import fs from "node:fs";

import path from "node:path";



export type PlaywrightRole = "admin" | "pm" | "contractor";



const AUTH_DIR = path.resolve(process.cwd(), "playwright/.auth");



export const ROLE_STORAGE_FILES: Record<PlaywrightRole, string> = {

  admin: path.join(AUTH_DIR, "admin.json"),

  pm: path.join(AUTH_DIR, "pm.json"),

  contractor: path.join(AUTH_DIR, "contractor.json"),

};



/** Legacy single-user path; defaults to admin storage. */

export const AUTH_STORAGE_PATH = path.resolve(

  process.cwd(),

  process.env.PLAYWRIGHT_STORAGE_STATE ?? ROLE_STORAGE_FILES.admin,

);



export function storagePathForRole(role: PlaywrightRole): string {

  const envKey = `PLAYWRIGHT_STORAGE_STATE_${role.toUpperCase()}` as

    | "PLAYWRIGHT_STORAGE_STATE_ADMIN"

    | "PLAYWRIGHT_STORAGE_STATE_PM"

    | "PLAYWRIGHT_STORAGE_STATE_CONTRACTOR";

  const fromEnv = process.env[envKey];

  if (fromEnv) return path.resolve(process.cwd(), fromEnv);

  return ROLE_STORAGE_FILES[role];

}



export function hasAuthStorage(filePath = AUTH_STORAGE_PATH): boolean {

  try {

    return fs.existsSync(filePath) && fs.statSync(filePath).size > 8;

  } catch {

    return false;

  }

}



export function hasRoleAuthStorage(role: PlaywrightRole): boolean {

  return hasAuthStorage(storagePathForRole(role));

}



export function skipUnlessAuth(filePath = AUTH_STORAGE_PATH): string | undefined {

  if (!hasAuthStorage(filePath)) {

    return `Missing Playwright auth at ${filePath} — run setup/auth.setup.ts`;

  }

  return undefined;

}



export function skipUnlessRoleAuth(role: PlaywrightRole): string | undefined {

  return skipUnlessAuth(storagePathForRole(role));

}



export function skipUnlessBackend(): string | undefined {

  if (process.env.PLAYWRIGHT_E2E_BACKEND !== "1") {

    return "Set PLAYWRIGHT_E2E_BACKEND=1 to run full-stack integration tests.";

  }

  return skipUnlessAuth();

}


