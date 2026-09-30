import { existsSync, readdirSync, readFileSync } from "fs";
import { isAbsolute, join, resolve } from "path";
import type {
  PolicyConfig,
  PolicyProfileId,
  TenantPolicyMap,
} from "./types";
import { policyConfigSchema, tenantPolicyMapSchema } from "./types";

let cache: {
  profiles: Map<string, PolicyConfig>;
  tenants: TenantPolicyMap;
} | null = null;

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function resolvePoliciesDir(explicit?: string): string {
  if (explicit) return explicit;
  if (process.env.VERA_AGENT_POLICIES_DIR) {
    return process.env.VERA_AGENT_POLICIES_DIR;
  }
  const candidates = [
    resolve(process.cwd(), "config/policies"),
    resolve(__dirname, "../../config/policies"),
    resolve(__dirname, "../../../config/policies"),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return candidates[0]!;
}

function loadProfileFile(dir: string, id: string): PolicyConfig {
  const path = join(dir, `${id}.json`);
  return policyConfigSchema.parse(readJson(path));
}

export function loadPolicyBundle(options?: {
  policiesDir?: string;
  tenantMapPath?: string;
}): {
  profiles: Map<string, PolicyConfig>;
  tenants: TenantPolicyMap;
} {
  if (cache && !options) return cache;

  const dir = resolvePoliciesDir(options?.policiesDir);

  const profiles = new Map<string, PolicyConfig>();
  for (const id of ["strict", "balanced"] as const) {
    try {
      profiles.set(id, loadProfileFile(dir, id));
    } catch {
      // optional custom dir may omit a profile
    }
  }

  try {
    for (const name of readdirSync(dir)) {
      if (!name.endsWith(".json") || name === "tenant-overrides.json") continue;
      const id = name.replace(/\.json$/, "");
      if (profiles.has(id)) continue;
      profiles.set(id, loadProfileFile(dir, id));
    }
  } catch {
    // ignore
  }

  if (!profiles.has("strict")) {
    throw new Error(`Missing required policy profile "strict" in ${dir}`);
  }

  const mapPath =
    options?.tenantMapPath ??
    process.env.VERA_AGENT_TENANT_POLICY_MAP ??
    join(dir, "tenant-overrides.json");

  let tenants: TenantPolicyMap = {
    defaultProfile: "strict",
    tenants: {},
  };
  try {
    const abs = isAbsolute(mapPath) ? mapPath : resolve(mapPath);
    if (existsSync(abs)) {
      tenants = tenantPolicyMapSchema.parse(readJson(abs));
    }
  } catch {
    // defaults
  }

  const bundle = { profiles, tenants };
  if (!options) cache = bundle;
  return bundle;
}

export function resolvePolicyConfig(
  companyId: number,
  preferred?: PolicyProfileId,
  bundle = loadPolicyBundle(),
): PolicyConfig {
  const key = String(companyId);
  const profileId =
    preferred ??
    bundle.tenants.tenants[key] ??
    bundle.tenants.defaultProfile ??
    "strict";

  const config = bundle.profiles.get(String(profileId));
  if (!config) {
    const fallback = bundle.profiles.get("strict");
    if (!fallback) throw new Error("No policy profiles loaded");
    return fallback;
  }
  return config;
}

/** Test helper — clear cache and optionally inject profiles. */
export function setPolicyBundleForTest(
  bundle: {
    profiles: Map<string, PolicyConfig>;
    tenants: TenantPolicyMap;
  } | null,
): void {
  cache = bundle;
}
