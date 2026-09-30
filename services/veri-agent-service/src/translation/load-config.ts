import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import {
  abstractionConfigSchema,
  type AbstractionConfig,
  type AbstractionLevel,
} from "./types";

const cache = new Map<string, AbstractionConfig>();

function resolveConfigPath(level: AbstractionLevel): string {
  const envKey =
    level === "strict"
      ? process.env.VERA_AGENT_TRANSLATION_STRICT_PATH
      : process.env.VERA_AGENT_TRANSLATION_RELAXED_PATH;
  if (envKey) return envKey;

  const candidates = [
    resolve(process.cwd(), `config/translation/${level}.json`),
    resolve(__dirname, `../../config/translation/${level}.json`),
    resolve(__dirname, `../../../config/translation/${level}.json`),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return candidates[0]!;
}

export function loadAbstractionConfig(
  level: AbstractionLevel = "strict",
): AbstractionConfig {
  const cached = cache.get(level);
  if (cached) return cached;
  const path = resolveConfigPath(level);
  const raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
  const parsed = abstractionConfigSchema.parse(raw);
  cache.set(level, parsed);
  return parsed;
}

export function setAbstractionConfigForTest(
  level: AbstractionLevel,
  config: AbstractionConfig | null,
): void {
  if (config == null) cache.delete(level);
  else cache.set(level, config);
}
