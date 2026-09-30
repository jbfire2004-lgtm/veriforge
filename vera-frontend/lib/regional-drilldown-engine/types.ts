/**
 * Regional Drilldown Engine — types
 * Hierarchy: Global → Continent → Country → Province/State → Region → City → Site
 */

export type GeoLevel =
  | "global"
  | "continent"
  | "country"
  | "province_state"
  | "region"
  | "city"
  | "site";

export type FocusIndustry = "mining" | "construction" | "manufacturing";

export type GeoNode = {
  level: GeoLevel;
  code: string;
  label: string;
  parentCode: string | null;
  /** Site-level data is tenant-scoped; excluded from cross-tenant industry pools */
  industryPoolAllowed: boolean;
};

export type RegionalSelectors = {
  regionCode: string;
  industry: FocusIndustry | "all";
  period: string;
};

export type NormalizedRegionalMetrics = {
  regionCode: string;
  regionLabel: string;
  level: GeoLevel;
  industry: FocusIndustry | "all";
  period: string;
  suppressed: boolean;
  entityCount: number | null;
  hours: number | null;
  trif: number | null;
  ltif: number | null;
  nearMissRate: number | null;
  severityIndex: number | null;
  leadingMaturity: number | null;
};

export type RegionWithinIndustryRow = {
  regionCode: string;
  regionLabel: string;
  level: GeoLevel;
  trif: number | null;
  ltif: number | null;
  nearMissRate: number | null;
  leadingMaturity: number | null;
  entityCount: number | null;
  suppressed: boolean;
  rankByTrif: number | null;
};

export type IndustryWithinRegionRow = {
  industry: FocusIndustry;
  trif: number | null;
  ltif: number | null;
  nearMissRate: number | null;
  leadingMaturity: number | null;
  entityCount: number | null;
  suppressed: boolean;
  rankByTrif: number | null;
};

export type DashboardFilterResult = {
  regionCode: string;
  breadcrumbs: GeoNode[];
  children: GeoNode[];
  metrics: NormalizedRegionalMetrics;
  /** Applies to any consumer dashboard — opaque filter token */
  filter: {
    regionCode: string;
    includeDescendants: true;
    industryPoolAllowed: boolean;
  };
};

export type RegionalDrilldownSnapshot = {
  generatedAt: string;
  revision: number;
  selectors: RegionalSelectors;
  hierarchy: GeoLevel[];
  breadcrumbs: GeoNode[];
  children: GeoNode[];
  filtered: DashboardFilterResult;
  /** Metrics normalized for the selected region band */
  regionMetrics: NormalizedRegionalMetrics;
  /** Sibling/child regions compared within one industry */
  regionsWithinIndustry: RegionWithinIndustryRow[];
  /** Industries compared within the selected region */
  industriesWithinRegion: IndustryWithinRegionRow[];
  rules: {
    hoursDenominator: 200000;
    minSample: number;
    siteExcludedFromIndustryPool: true;
    metricsNormalizedByRegion: true;
  };
};
