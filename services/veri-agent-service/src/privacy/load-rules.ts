import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import {
  redactionRulesSchema,
  type RedactionRulesConfig,
} from "./types";

let cached: RedactionRulesConfig | null = null;

function resolveRulesPath(explicit?: string): string {
  if (explicit) return explicit;
  if (process.env.VERA_AGENT_REDACTION_RULES_PATH) {
    return process.env.VERA_AGENT_REDACTION_RULES_PATH;
  }
  const candidates = [
    resolve(process.cwd(), "config/redaction-rules.json"),
    resolve(__dirname, "../../config/redaction-rules.json"),
    resolve(__dirname, "../../../config/redaction-rules.json"),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return candidates[0]!;
}

export function loadRedactionRules(path?: string): RedactionRulesConfig {
  if (!path && cached) return cached;
  const file = resolveRulesPath(path);
  const raw = JSON.parse(readFileSync(file, "utf8")) as unknown;
  const parsed = redactionRulesSchema.parse(raw);
  if (!path) cached = parsed;
  return parsed;
}

/** Test helper — inject rules without touching disk. */
export function setRedactionRulesForTest(
  rules: RedactionRulesConfig | null,
): void {
  cached = rules;
}
