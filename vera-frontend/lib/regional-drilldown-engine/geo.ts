/**
 * Canonical geo hierarchy:
 * Global → Continent → Country → Province/State → Region → City → Site
 */

import type { GeoLevel, GeoNode } from "./types";

export const GEO_LEVEL_ORDER: GeoLevel[] = [
  "global",
  "continent",
  "country",
  "province_state",
  "region",
  "city",
  "site",
];

export const GEO_TREE: GeoNode[] = [
  { level: "global", code: "GLB", label: "Global", parentCode: null, industryPoolAllowed: true },
  { level: "continent", code: "NA", label: "North America", parentCode: "GLB", industryPoolAllowed: true },
  { level: "continent", code: "EU", label: "Europe", parentCode: "GLB", industryPoolAllowed: true },
  { level: "country", code: "CA", label: "Canada", parentCode: "NA", industryPoolAllowed: true },
  { level: "country", code: "US", label: "United States", parentCode: "NA", industryPoolAllowed: true },
  { level: "country", code: "DE", label: "Germany", parentCode: "EU", industryPoolAllowed: true },
  { level: "province_state", code: "CA-AB", label: "Alberta", parentCode: "CA", industryPoolAllowed: true },
  { level: "province_state", code: "CA-BC", label: "British Columbia", parentCode: "CA", industryPoolAllowed: true },
  { level: "province_state", code: "CA-ON", label: "Ontario", parentCode: "CA", industryPoolAllowed: true },
  { level: "province_state", code: "US-TX", label: "Texas", parentCode: "US", industryPoolAllowed: true },
  { level: "province_state", code: "US-NV", label: "Nevada", parentCode: "US", industryPoolAllowed: true },
  { level: "region", code: "CA-AB-north", label: "Northern Alberta", parentCode: "CA-AB", industryPoolAllowed: true },
  { level: "region", code: "CA-AB-central", label: "Central Alberta", parentCode: "CA-AB", industryPoolAllowed: true },
  { level: "region", code: "US-TX-gulf", label: "Gulf Coast TX", parentCode: "US-TX", industryPoolAllowed: true },
  { level: "region", code: "US-NV-north", label: "Northern Nevada", parentCode: "US-NV", industryPoolAllowed: true },
  { level: "city", code: "CA-AB-edm", label: "Edmonton", parentCode: "CA-AB-central", industryPoolAllowed: true },
  { level: "city", code: "CA-AB-yyc", label: "Calgary", parentCode: "CA-AB-central", industryPoolAllowed: true },
  { level: "city", code: "CA-AB-fsj", label: "Fort St. / North sites band", parentCode: "CA-AB-north", industryPoolAllowed: true },
  { level: "city", code: "US-TX-hou", label: "Houston", parentCode: "US-TX-gulf", industryPoolAllowed: true },
  { level: "city", code: "US-NV-elko", label: "Elko", parentCode: "US-NV-north", industryPoolAllowed: true },
  { level: "site", code: "site_aurora", label: "Aurora Site", parentCode: "CA-AB-edm", industryPoolAllowed: false },
  { level: "site", code: "site_ridge", label: "Ridge Site", parentCode: "CA-AB-yyc", industryPoolAllowed: false },
  { level: "site", code: "site_gulf1", label: "Gulf Fabrication Yard", parentCode: "US-TX-hou", industryPoolAllowed: false },
  { level: "site", code: "site_elko1", label: "Elko Mine Complex", parentCode: "US-NV-elko", industryPoolAllowed: false },
];

export function getGeoNode(code: string): GeoNode | undefined {
  return GEO_TREE.find((n) => n.code === code);
}

export function childrenOf(code: string): GeoNode[] {
  return GEO_TREE.filter((n) => n.parentCode === code);
}

export function breadcrumbs(code: string): GeoNode[] {
  const out: GeoNode[] = [];
  let cur = getGeoNode(code);
  while (cur) {
    out.unshift(cur);
    cur = cur.parentCode ? getGeoNode(cur.parentCode) : undefined;
  }
  return out;
}

export function regionMatches(factRegion: string, selected: string): boolean {
  if (selected === "GLB" || selected.toUpperCase() === "GLB") return true;
  if (factRegion.toUpperCase() === selected.toUpperCase()) return true;
  if (factRegion.toUpperCase().startsWith(`${selected.toUpperCase()}-`)) return true;
  const chain = breadcrumbs(factRegion).map((b) => b.code.toUpperCase());
  return chain.includes(selected.toUpperCase());
}

export function canIndustryAggregate(level: GeoLevel): boolean {
  return level !== "site";
}

export function descendantCodes(code: string): string[] {
  const out: string[] = [code];
  const queue = [code];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const child of childrenOf(cur)) {
      out.push(child.code);
      queue.push(child.code);
    }
  }
  return out;
}
