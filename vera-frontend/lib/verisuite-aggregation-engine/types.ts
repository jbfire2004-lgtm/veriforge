/**
 * VeriSuite AI Industry Data Aggregation Engine — types
 */

export type FocusIndustry = "mining" | "construction" | "manufacturing";

export type SourceKind =
  | "safety_dashboard"
  | "incident_database"
  | "regulatory_report"
  | "industry_kpi";

export type ExtractModality = "llm" | "vision" | "scrape";

export type SearchQuery = {
  id: string;
  industry: FocusIndustry;
  kind: SourceKind;
  query: string;
  lastRunAt: string | null;
  status: "idle" | "running" | "ok" | "error";
};

export type DiscoveredSource = {
  id: string;
  url: string;
  title: string;
  kind: SourceKind;
  industry: FocusIndustry;
  confidence: number;
  discoveredAt: string;
  modalities: ExtractModality[];
};

export type RawExtractedPayload = {
  sourceId: string;
  modality: ExtractModality;
  industry: FocusIndustry;
  period: string;
  regionCode: string;
  hours: number;
  recordables: number;
  lostTimeInjuries: number;
  severityWeight: number;
  nearMisses: number;
  leadingMaturity: number;
  // stripped before analytics
  organizationName?: string;
  contactEmail?: string;
  authorName?: string;
  siteAddress?: string;
};

export type NormalizedIndustryFact = {
  token: string;
  sourceId: string;
  modality: ExtractModality;
  industry: FocusIndustry;
  kind: SourceKind;
  period: string;
  regionBand: string;
  hours: number;
  trif: number;
  ltif: number;
  nearMissRate: number;
  severityIndex: number;
  leadingMaturity: number;
  ingestedAt: string;
  extractConfidence: number;
};

export type IndustryBenchmark = {
  industry: FocusIndustry;
  period: string;
  asOfDate: string;
  suppressed: boolean;
  entityCount: number | null;
  trif: number | null;
  ltif: number | null;
  nearMissRate: number | null;
  severityIndex: number | null;
  leadingMaturity: number | null;
  deltaTrifVsPrior: number | null;
};

export type EngineNarrative = {
  id: string;
  industry: FocusIndustry;
  tone: "neutral" | "positive" | "caution" | "alert";
  category: "trend" | "anomaly" | "risk";
  headline: string;
  body: string;
  evidence: string[];
  generatedAt: string;
};

export type ExtractJobResult = {
  sourceId: string;
  modality: ExtractModality;
  status: "ok" | "partial" | "failed";
  factsAdded: number;
  strippedFields: string[];
  durationMs: number;
};

export type DailyUpdateResult = {
  date: string;
  searchRuns: number;
  sourcesDiscovered: number;
  extractions: ExtractJobResult[];
  factsNormalized: number;
  benchmarksUpdated: IndustryBenchmark[];
  narratives: EngineNarrative[];
  revision: number;
};

export type EngineStatus = {
  generatedAt: string;
  revision: number;
  continuousSearchEnabled: true;
  lastDailyUpdateAt: string | null;
  nextDailyUpdateAt: string;
  queries: SearchQuery[];
  sources: DiscoveredSource[];
  factCount: number;
  benchmarks: IndustryBenchmark[];
  narratives: EngineNarrative[];
  recentExtractions: ExtractJobResult[];
  pipeline: {
    search: "continuous";
    extract: ExtractModality[];
    normalize: true;
    tokenizeAnonymize: true;
    dailyBenchmarks: true;
    aiNarratives: true;
  };
  rules: {
    minSample: number;
    hoursDenominator: 200000;
    externalDataAnonymized: true;
    metricsNormalized: true;
  };
};
