import { loadRedactionRules } from "../privacy/load-rules";
import type { RedactionRulesConfig } from "../privacy/types";

export type RedactionAccumulator = {
  count: number;
  rulesApplied: Set<string>;
};

function compilePatterns(rules: RedactionRulesConfig) {
  return rules.patterns.map((p) => ({
    id: p.id,
    re: new RegExp(p.regex, p.flags || "gi"),
    replacement: p.replacement,
  }));
}

/**
 * Apply privacy firewall redaction patterns during translation.
 * Translation respects redaction rules; it does not replace the firewall.
 */
export function sanitizeText(
  input: string,
  acc: RedactionAccumulator,
  rules?: RedactionRulesConfig,
): string {
  const cfg = rules ?? loadRedactionRules();
  let text = input ?? "";
  for (const p of compilePatterns(cfg)) {
    const before = text;
    text = text.replace(p.re, p.replacement);
    if (text !== before) {
      acc.rulesApplied.add(p.id);
      const matches = before.match(new RegExp(p.re.source, p.re.flags));
      acc.count += matches?.length ?? 1;
    }
  }
  return text;
}

/** Drop known sensitive keys from objects before any stringification. */
export function stripIdentifierFields<T extends Record<string, unknown>>(
  obj: T,
): Partial<T> {
  const drop = new Set([
    "workerNames",
    "workers",
    "locations",
    "location",
    "companyLegalName",
    "companyName",
    "siteAddress",
    "clientName",
    "name",
    "gps",
    "email",
    "phone",
    "fullName",
    "imageBase64",
  ]);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (drop.has(k)) continue;
    out[k] = v;
  }
  return out as Partial<T>;
}

export function truncate(s: string, n: number): string {
  const t = s.trim();
  return t.length <= n ? t : `${t.slice(0, n - 1)}…`;
}

export function hashKey(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return `ref:${Math.abs(h)}`;
}

export function newRedactionAcc(): RedactionAccumulator {
  return { count: 0, rulesApplied: new Set() };
}
