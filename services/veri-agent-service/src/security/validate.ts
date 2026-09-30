import type { ZodSchema, ZodError } from "zod";
import { VeriAgentError } from "../core/types";

export type ValidationSuccess<T> = {
  ok: true;
  data: T;
};

export type ValidationFailure = {
  ok: false;
  issues: ReturnType<ZodError["flatten"]>;
  unexpectedKeys: string[];
};

/**
 * Validate input against a Zod schema.
 * Rejects malformed data; reports unexpected keys when schema is strict.
 */
export function validateInput<T>(
  schema: ZodSchema<T>,
  input: unknown,
): ValidationSuccess<T> | ValidationFailure {
  const parsed = schema.safeParse(input);
  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }

  const unexpectedKeys = parsed.error.issues
    .filter((i) => i.code === "unrecognized_keys")
    .flatMap((i) => {
      const keys = (i as { keys?: string[] }).keys;
      return keys ?? [];
    });

  return {
    ok: false,
    issues: parsed.error.flatten(),
    unexpectedKeys,
  };
}

export function assertValidInput<T>(schema: ZodSchema<T>, input: unknown): T {
  const result = validateInput(schema, input);
  if (!result.ok) {
    throw new VeriAgentError(400, "validation_error", "Invalid request body", {
      issues: result.issues,
      unexpectedKeys: result.unexpectedKeys,
    });
  }
  return result.data;
}

/** Detect privacy-bypass style fields that should never appear in API bodies. */
export const SUSPICIOUS_BODY_KEYS = [
  "allowImageEgressOverride",
  "privacyCleared",
  "skipFirewall",
  "bypassPrivacy",
  "rawPrompt",
  "systemPrompt",
  "messages",
  "apiKey",
  "VERA_LLM_API_KEY",
] as const;

export function findSuspiciousKeys(
  value: unknown,
  depth = 0,
  found: string[] = [],
): string[] {
  if (depth > 6 || value == null) return found;
  if (Array.isArray(value)) {
    for (const v of value.slice(0, 50)) findSuspiciousKeys(v, depth + 1, found);
    return found;
  }
  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (
        (SUSPICIOUS_BODY_KEYS as readonly string[]).includes(k) &&
        !found.includes(k)
      ) {
        found.push(k);
      }
      findSuspiciousKeys(v, depth + 1, found);
    }
  }
  return found;
}
