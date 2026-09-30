/**
 * Aggregation engine store + continuous search / daily update orchestration.
 */

import {
  buildInitialQueries,
  buildSeedSources,
  discoverFromQuery,
} from "./catalog";
import { extractFromSource } from "./extract";
import { buildBenchmarks, generateNarratives } from "./benchmarks";
import { MIN_SAMPLE } from "./normalize";
import type {
  DailyUpdateResult,
  DiscoveredSource,
  EngineStatus,
  ExtractJobResult,
  NormalizedIndustryFact,
  SearchQuery,
} from "./types";

type Store = {
  revision: number;
  queries: SearchQuery[];
  sources: DiscoveredSource[];
  facts: NormalizedIndustryFact[];
  recentExtractions: ExtractJobResult[];
  lastDailyUpdateAt: string | null;
  continuousSearchEnabled: true;
};

const g = globalThis as unknown as { __verisuiteAggEngine?: Store };

function nowIso() {
  return new Date().toISOString();
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function nextDailyAt(from = new Date()): string {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(6, 0, 0, 0);
  return d.toISOString();
}

function seedPriorPeriodFacts(
  sources: DiscoveredSource[],
): NormalizedIndustryFact[] {
  // Seed Q1 facts so daily delta narratives have a prior baseline
  const facts: NormalizedIndustryFact[] = [];
  let i = 0;
  for (const source of sources) {
    for (let n = 0; n < 2; n++) {
      i += 1;
      const { facts: extracted } = extractFromSource(source, i + 100);
      for (const f of extracted) {
        facts.push({
          ...f,
          period: "2026-Q1",
          token: `${f.token}_q1`,
          hours: f.hours * 0.95,
          trif: Math.round(f.trif * 1.05 * 100) / 100,
        });
      }
    }
  }
  return facts;
}

function store(): Store {
  if (!g.__verisuiteAggEngine) {
    const now = nowIso();
    const sources = buildSeedSources(now);
    const facts: NormalizedIndustryFact[] = [...seedPriorPeriodFacts(sources)];
    const recent: ExtractJobResult[] = [];
    // Initial extract pass for current period
    sources.forEach((source, idx) => {
      const { facts: extracted, result } = extractFromSource(source, idx + 1);
      facts.push(...extracted);
      recent.push(result);
    });
    g.__verisuiteAggEngine = {
      revision: 1,
      queries: buildInitialQueries(),
      sources,
      facts,
      recentExtractions: recent,
      lastDailyUpdateAt: now,
      continuousSearchEnabled: true,
    };
  }
  return g.__verisuiteAggEngine;
}

/** Run continuous search cycle across all intents. */
export function runContinuousSearch(): {
  searchRuns: number;
  discovered: DiscoveredSource[];
} {
  const s = store();
  const now = nowIso();
  const discovered: DiscoveredSource[] = [];
  for (const q of s.queries) {
    q.status = "running";
    q.lastRunAt = now;
    const src = discoverFromQuery(q, s.revision, now);
    // Dedupe by URL
    if (!s.sources.some((x) => x.url === src.url)) {
      s.sources.push(src);
      discovered.push(src);
    }
    q.status = "ok";
  }
  s.revision += 1;
  return { searchRuns: s.queries.length, discovered };
}

/** Extract from newly discovered (or all) sources via LLM + vision + scrape. */
export function runExtraction(sourceIds?: string[]): ExtractJobResult[] {
  const s = store();
  const targets = sourceIds?.length
    ? s.sources.filter((x) => sourceIds.includes(x.id))
    : s.sources.slice(-6);
  const results: ExtractJobResult[] = [];
  targets.forEach((source, idx) => {
    const { facts, result } = extractFromSource(source, s.revision + idx);
    s.facts.push(...facts);
    results.push(result);
  });
  s.recentExtractions = [...results, ...s.recentExtractions].slice(0, 24);
  s.revision += 1;
  return results;
}

/** Full daily pipeline: search → extract → normalize (already) → benchmarks → narratives. */
export function runDailyUpdate(): DailyUpdateResult {
  const s = store();
  const date = todayDate();
  const { searchRuns, discovered } = runContinuousSearch();
  const extractions = runExtraction(discovered.map((d) => d.id));
  // Also refresh a sample of existing sources
  const refresh = runExtraction(s.sources.slice(0, 3).map((x) => x.id));
  const allExtractions = [...extractions, ...refresh];

  const benchmarks = buildBenchmarks(s.facts, date);
  const narratives = generateNarratives(benchmarks, s.facts, nowIso());
  s.lastDailyUpdateAt = nowIso();
  s.revision += 1;

  return {
    date,
    searchRuns,
    sourcesDiscovered: discovered.length,
    extractions: allExtractions,
    factsNormalized: allExtractions.reduce((a, e) => a + e.factsAdded, 0),
    benchmarksUpdated: benchmarks,
    narratives,
    revision: s.revision,
  };
}

export function getEngineStatus(): EngineStatus {
  const s = store();
  const asOf = (s.lastDailyUpdateAt ?? nowIso()).slice(0, 10);
  const benchmarks = buildBenchmarks(s.facts, asOf);
  const narratives = generateNarratives(benchmarks, s.facts, nowIso());

  return {
    generatedAt: nowIso(),
    revision: s.revision,
    continuousSearchEnabled: true,
    lastDailyUpdateAt: s.lastDailyUpdateAt,
    nextDailyUpdateAt: nextDailyAt(
      s.lastDailyUpdateAt ? new Date(s.lastDailyUpdateAt) : new Date(),
    ),
    queries: s.queries,
    sources: s.sources,
    factCount: s.facts.length,
    benchmarks,
    narratives,
    recentExtractions: s.recentExtractions,
    pipeline: {
      search: "continuous",
      extract: ["llm", "vision", "scrape"],
      normalize: true,
      tokenizeAnonymize: true,
      dailyBenchmarks: true,
      aiNarratives: true,
    },
    rules: {
      minSample: MIN_SAMPLE,
      hoursDenominator: 200000,
      externalDataAnonymized: true,
      metricsNormalized: true,
    },
  };
}

export function getFacts() {
  return store().facts;
}
