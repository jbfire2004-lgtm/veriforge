/**
 * Continuous web search catalog — safety dashboards, incident DBs, regs, KPIs.
 * Preview: curated search intents + discovery simulation (no live scraping).
 */

import type {
  DiscoveredSource,
  ExtractModality,
  FocusIndustry,
  SearchQuery,
  SourceKind,
} from "./types";

export const SEARCH_INTENTS: Array<{
  industry: FocusIndustry;
  kind: SourceKind;
  query: string;
}> = [
  {
    industry: "mining",
    kind: "safety_dashboard",
    query: "mining industry safety dashboard TRIF LTIF open data",
  },
  {
    industry: "mining",
    kind: "incident_database",
    query: "MSHA mine incident statistics database",
  },
  {
    industry: "mining",
    kind: "regulatory_report",
    query: "mining occupational health annual regulatory report",
  },
  {
    industry: "construction",
    kind: "safety_dashboard",
    query: "construction safety KPI dashboard OSHA injury rates",
  },
  {
    industry: "construction",
    kind: "incident_database",
    query: "construction fatality and recordable incident database",
  },
  {
    industry: "construction",
    kind: "industry_kpi",
    query: "construction association TRIF LTIF leading indicators benchmarks",
  },
  {
    industry: "manufacturing",
    kind: "regulatory_report",
    query: "manufacturing workplace injury government statistical report",
  },
  {
    industry: "manufacturing",
    kind: "industry_kpi",
    query: "manufacturing safety excellence KPIs severity rate",
  },
  {
    industry: "manufacturing",
    kind: "safety_dashboard",
    query: "manufacturing public safety performance dashboard",
  },
];

const SEED_SOURCES: Array<{
  url: string;
  title: string;
  kind: SourceKind;
  industry: FocusIndustry;
  modalities: ExtractModality[];
}> = [
  {
    url: "https://example.gov/mining/safety-dashboard",
    title: "National Mining Safety Open Dashboard",
    kind: "safety_dashboard",
    industry: "mining",
    modalities: ["scrape", "vision", "llm"],
  },
  {
    url: "https://example.gov/msha/incident-stats",
    title: "MSHA Incident Statistics Tables",
    kind: "incident_database",
    industry: "mining",
    modalities: ["scrape", "llm"],
  },
  {
    url: "https://example.gov/labour/mining-ohs-2025.pdf",
    title: "Mining OHS Annual Regulatory Report (PDF)",
    kind: "regulatory_report",
    industry: "mining",
    modalities: ["vision", "llm"],
  },
  {
    url: "https://example.org/construction/safety-kpis",
    title: "Construction Safety Association KPI Portal",
    kind: "industry_kpi",
    industry: "construction",
    modalities: ["scrape", "llm"],
  },
  {
    url: "https://example.gov/osha/construction-dashboard",
    title: "OSHA Construction Injury Dashboard",
    kind: "safety_dashboard",
    industry: "construction",
    modalities: ["scrape", "vision", "llm"],
  },
  {
    url: "https://example.gov/osha/construction-incidents",
    title: "Construction Incident Database Extract",
    kind: "incident_database",
    industry: "construction",
    modalities: ["scrape", "llm"],
  },
  {
    url: "https://example.gov/labour/manufacturing-injury-2025.pdf",
    title: "Manufacturing Injury Statistical Report",
    kind: "regulatory_report",
    industry: "manufacturing",
    modalities: ["vision", "llm"],
  },
  {
    url: "https://example.org/mfg/safety-excellence",
    title: "Manufacturing Excellence Safety KPI Hub",
    kind: "industry_kpi",
    industry: "manufacturing",
    modalities: ["scrape", "llm"],
  },
  {
    url: "https://example.gov/manufacturing/public-safety",
    title: "Public Manufacturing Safety Dashboard",
    kind: "safety_dashboard",
    industry: "manufacturing",
    modalities: ["scrape", "vision"],
  },
];

export function buildInitialQueries(): SearchQuery[] {
  return SEARCH_INTENTS.map((intent, i) => ({
    id: `q_${i + 1}`,
    industry: intent.industry,
    kind: intent.kind,
    query: intent.query,
    lastRunAt: null,
    status: "idle" as const,
  }));
}

export function buildSeedSources(now: string): DiscoveredSource[] {
  return SEED_SOURCES.map((s, i) => ({
    id: `src_${i + 1}`,
    url: s.url,
    title: s.title,
    kind: s.kind,
    industry: s.industry,
    confidence: 0.78 + (i % 5) * 0.04,
    discoveredAt: now,
    modalities: s.modalities,
  }));
}

/** Simulate discovering an additional source from a search query. */
export function discoverFromQuery(
  query: SearchQuery,
  revision: number,
  now: string,
): DiscoveredSource {
  const slug = query.kind.replace(/_/g, "-");
  return {
    id: `src_dyn_${query.id}_${revision}`,
    url: `https://example.discover/${query.industry}/${slug}/r${revision}`,
    title: `${query.industry} ${query.kind} — discovered feed #${revision}`,
    kind: query.kind,
    industry: query.industry,
    confidence: 0.72 + (revision % 7) * 0.03,
    discoveredAt: now,
    modalities:
      query.kind === "regulatory_report"
        ? ["vision", "llm"]
        : query.kind === "safety_dashboard"
          ? ["scrape", "vision", "llm"]
          : ["scrape", "llm"],
  };
}
