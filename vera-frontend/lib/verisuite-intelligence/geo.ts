/**
 * VeriSuite Intelligence — geo hierarchy + regional drilldown.
 * Industry pool stops at city_band; site_band is tenant-only.
 */

export type GeoLevel =
  | "global"
  | "continent"
  | "country"
  | "province_state"
  | "region"
  | "city_band"
  | "site_band";

export type GeoNode = {
  level: GeoLevel;
  code: string;
  label: string;
  parentCode: string | null;
  industryPoolAllowed: boolean;
};

/** Canonical hierarchy seed (preview). */
export const GEO_TREE: GeoNode[] = [
  { level: "global", code: "GLB", label: "Global", parentCode: null, industryPoolAllowed: true },
  { level: "continent", code: "NA", label: "North America", parentCode: "GLB", industryPoolAllowed: true },
  { level: "continent", code: "EU", label: "Europe", parentCode: "GLB", industryPoolAllowed: true },
  { level: "country", code: "CA", label: "Canada", parentCode: "NA", industryPoolAllowed: true },
  { level: "country", code: "US", label: "United States", parentCode: "NA", industryPoolAllowed: true },
  { level: "province_state", code: "CA-AB", label: "Alberta", parentCode: "CA", industryPoolAllowed: true },
  { level: "province_state", code: "CA-BC", label: "British Columbia", parentCode: "CA", industryPoolAllowed: true },
  { level: "province_state", code: "US-TX", label: "Texas", parentCode: "US", industryPoolAllowed: true },
  { level: "region", code: "CA-AB-north", label: "Northern Alberta", parentCode: "CA-AB", industryPoolAllowed: true },
  { level: "region", code: "CA-AB-central", label: "Central Alberta", parentCode: "CA-AB", industryPoolAllowed: true },
  { level: "city_band", code: "CA-AB-edm", label: "Edmonton metro (band)", parentCode: "CA-AB-central", industryPoolAllowed: true },
  { level: "city_band", code: "CA-AB-yyc", label: "Calgary metro (band)", parentCode: "CA-AB-central", industryPoolAllowed: true },
  { level: "site_band", code: "site_aurora", label: "Site band (tenant only)", parentCode: "CA-AB-edm", industryPoolAllowed: false },
];

export const GEO_LEVEL_ORDER: GeoLevel[] = [
  "global",
  "continent",
  "country",
  "province_state",
  "region",
  "city_band",
  "site_band",
];

export function getGeoNode(code: string): GeoNode | undefined {
  return GEO_TREE.find((n) => n.code === code);
}

export function childrenOf(code: string): GeoNode[] {
  return GEO_TREE.filter((n) => n.parentCode === code);
}

export function breadcrumbs(code: string): GeoNode[] {
  const out: GeoNode[] = [];
  let cur: GeoNode | undefined = getGeoNode(code);
  while (cur) {
    out.unshift(cur);
    cur = cur.parentCode ? getGeoNode(cur.parentCode) : undefined;
  }
  return out;
}

export function canIndustryAggregate(level: GeoLevel): boolean {
  return level !== "site_band";
}
