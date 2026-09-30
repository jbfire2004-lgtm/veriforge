import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import type { AppConfig } from "../config";
import {
  securityConfigSchema,
  type SecurityConfig,
} from "./types";

let cached: SecurityConfig | null = null;

function resolvePath(): string {
  if (process.env.VERA_AGENT_SECURITY_CONFIG) {
    return process.env.VERA_AGENT_SECURITY_CONFIG;
  }
  const candidates = [
    resolve(process.cwd(), "config/security.json"),
    resolve(__dirname, "../../config/security.json"),
    resolve(__dirname, "../../../config/security.json"),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return candidates[0]!;
}

export function loadSecurityConfig(
  app?: AppConfig,
  explicitPath?: string,
): SecurityConfig {
  if (!explicitPath && cached) return cached;

  const path = explicitPath ?? resolvePath();
  let raw: unknown = { version: 1 };
  if (existsSync(path)) {
    raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
  }
  const parsed = securityConfigSchema.parse(raw);

  // Env override for global tenant rate
  if (app?.RATE_LIMIT_PER_MINUTE) {
    parsed.rateLimit.perTenant = app.RATE_LIMIT_PER_MINUTE;
  }

  if (!explicitPath) cached = parsed;
  return parsed;
}

export function setSecurityConfigForTest(config: SecurityConfig | null): void {
  cached = config;
}

export function resolveTenantSecurity(
  config: SecurityConfig,
  companyId?: number,
): {
  rateLimit: SecurityConfig["rateLimit"];
  abuse: SecurityConfig["abuse"];
} {
  const key = companyId != null ? String(companyId) : "";
  const over = key ? config.tenantOverrides[key] : undefined;
  return {
    rateLimit: {
      ...config.rateLimit,
      ...(over?.rateLimit ?? {}),
    },
    abuse: {
      ...config.abuse,
      ...(over?.abuse ?? {}),
    },
  };
}
